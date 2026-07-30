import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import ClipUrlForm from '../components/ClipUrlForm.jsx'
import { stickerAssets } from '../data.js'
import { ApiError, createClip, createSticker, downloadMedia, loginUrl, mediaUrl, pollJob } from '../api.js'
import { useAuth } from '../auth.jsx'

const MAX_SEGMENT = 5
const MIN_SEGMENT = 0.5
const PENDING_KEY = 'clipy:pending'

const STAGE_TO_STEP = {
  downloading: 0,
  encoding_preview: 0,
  trimming: 1,
  analyzing: 1,
  capturing: 1,
  generating: 2,
  finalizing: 2,
}

const WORKSPACE_STEPS = ['링크 입력', '구간 선택', '완성']

const STATUS_TO_WORKSPACE_STEP = {
  idle: 0,
  loading: 0,
  trimming: 1,
  processing: 1,
  complete: 2,
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const stickerFilename = ({ stickerUrl, emotion }) => {
  const ext = /\.([a-z0-9]+)(?:[?#]|$)/i.exec(stickerUrl ?? '')?.[1] ?? 'png'
  const label = (emotion ?? '').trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')
  return label ? `clipy-${label}.${ext}` : `clipy-sticker.${ext}`
}

export default function CreatePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, loading: authLoading, refresh } = useAuth()
  const [url, setUrl] = useState(() => searchParams.get('url') ?? '')
  const [mode, setMode] = useState(searchParams.get('mode') === 'animated' ? 'animated' : 'static')

  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState(null)
  const [error, setError] = useState('')
  const [stickerStyle, setStickerStyle] = useState('character')

  const [clipId, setClipId] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [duration, setDuration] = useState(0)
  const [range, setRange] = useState({ start: 0, end: 0 })
  const [result, setResult] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  const pollAbortRef = useRef(null)
  const mountedRef = useRef(true)
  const videoRef = useRef(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      pollAbortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    const authError = searchParams.get('authError')
    if (!authError) return

    setError(authError === 'AUTH_FAILED'
      ? '구글 로그인에 실패했어요. 다시 시도해 주세요.'
      : '로그인을 완료하지 못했어요. 다시 시도해 주세요.')
    const next = new URLSearchParams(searchParams)
    next.delete('authError')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    let pending
    try {
      pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null')
    } catch {
      sessionStorage.removeItem(PENDING_KEY)
      return
    }
    if (!pending?.clipId) return

    sessionStorage.removeItem(PENDING_KEY)
    setUrl(pending.url || '')
    setClipId(pending.clipId)
    setPreviewUrl(pending.previewUrl || null)
    setDuration(Number(pending.duration) || 0)
    setRange(pending.range || { start: 0, end: 0 })
    setStickerStyle(pending.stickerStyle === 'original' ? 'original' : 'character')
    setMode(pending.mode === 'animated' ? 'animated' : 'static')
    setStatus('trimming')
  }, [])

  const activeStep = stage ? (STAGE_TO_STEP[stage] ?? 0) : 0
  const workspaceStep = STATUS_TO_WORKSPACE_STEP[status]
  const isAnimated = mode === 'animated'

  const handleUrlChange = (value) => {
    setUrl(value)
    setError('')
  }

  const startMaking = async (validatedUrl) => {
    setError('')
    setStatus('loading')
    setProgress(0)
    setStage(null)

    const controller = new AbortController()
    pollAbortRef.current = controller

    try {
      const { jobId } = await createClip(validatedUrl)
      const clipResult = await pollJob(jobId, {
        signal: controller.signal,
        onProgress: (job) => {
          if (!mountedRef.current) return
          setProgress(job.progress ?? 0)
          setStage(job.stage ?? null)
        },
      })
      if (!mountedRef.current) return
      setClipId(clipResult.clipId)
      setPreviewUrl(clipResult.previewUrl)
      setDuration(clipResult.duration)
      const initialEnd = clamp(MAX_SEGMENT, MIN_SEGMENT, clipResult.duration || MAX_SEGMENT)
      setRange({ start: 0, end: initialEnd })
      setStatus('trimming')
    } catch (err) {
      if (controller.signal.aborted || !mountedRef.current) return
      setError(err.message || '클립을 불러오지 못했어요.')
      setStatus('idle')
    }
  }

  const handleStartChange = (event) => {
    const raw = Number(event.target.value)
    setRange(({ end }) => {
      let nextStart = clamp(raw, 0, duration)
      nextStart = Math.min(nextStart, end - MIN_SEGMENT)
      nextStart = Math.max(nextStart, 0)
      let nextEnd = end
      if (nextEnd - nextStart > MAX_SEGMENT) nextEnd = clamp(nextStart + MAX_SEGMENT, 0, duration)
      if (nextEnd - nextStart > MAX_SEGMENT) nextStart = nextEnd - MAX_SEGMENT
      return { start: nextStart, end: nextEnd }
    })
    if (videoRef.current) videoRef.current.currentTime = raw
  }

  const handleEndChange = (event) => {
    const raw = Number(event.target.value)
    setRange(({ start }) => {
      let nextEnd = clamp(raw, 0, duration)
      nextEnd = Math.max(nextEnd, start + MIN_SEGMENT)
      nextEnd = Math.min(nextEnd, duration)
      let nextStart = start
      if (nextEnd - nextStart > MAX_SEGMENT) nextStart = Math.max(0, nextEnd - MAX_SEGMENT)
      if (nextEnd - nextStart > MAX_SEGMENT) nextEnd = nextStart + MAX_SEGMENT
      return { start: nextStart, end: nextEnd }
    })
    if (videoRef.current) videoRef.current.currentTime = raw
  }

  const handleConfirmTrim = async () => {
    if (!clipId) return
    if (authLoading) return
    if (!user) {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify({
        url,
        clipId,
        previewUrl,
        duration,
        range,
        stickerStyle,
        mode,
      }))
      window.location.href = loginUrl('/create')
      return
    }
    if (user.quotaRemaining <= 0) {
      setError(`생성 한도 ${user.quotaLimit}회를 모두 사용했어요.`)
      return
    }
    setError('')
    setDownloadError('')
    setStatus('processing')
    setProgress(0)
    setStage(null)

    const controller = new AbortController()
    pollAbortRef.current = controller

    try {
      const { jobId } = await createSticker(clipId, { start: range.start, end: range.end, mode: stickerStyle })
      const stickerResult = await pollJob(jobId, {
        signal: controller.signal,
        onProgress: (job) => {
          if (!mountedRef.current) return
          setProgress(job.progress ?? 0)
          setStage(job.stage ?? null)
        },
      })
      if (!mountedRef.current) return
      setResult(stickerResult)
      setStatus('complete')
      await refresh()
    } catch (err) {
      if (controller.signal.aborted || !mountedRef.current) return
      if (err instanceof ApiError && ['QUOTA_EXCEEDED', 'UNAUTHENTICATED'].includes(err.code)) {
        await refresh()
      }
      setError(err.message || '스티커 생성에 실패했어요.')
      setStatus('trimming')
    }
  }

  const handleDownload = async () => {
    if (!result || downloading) return
    setDownloadError('')
    setDownloading(true)
    try {
      await downloadMedia(result.stickerUrl, stickerFilename(result))
    } catch (err) {
      if (!mountedRef.current) return
      setDownloadError(err.message || '스티커를 내려받지 못했어요.')
    } finally {
      if (mountedRef.current) setDownloading(false)
    }
  }

  const reset = () => {
    pollAbortRef.current?.abort()
    setStatus('idle')
    setUrl('')
    setError('')
    setProgress(0)
    setStage(null)
    setClipId(null)
    setPreviewUrl(null)
    setDuration(0)
    setRange({ start: 0, end: 0 })
    setResult(null)
    setDownloading(false)
    setDownloadError('')
  }

  return (
    <div className="site-shell">
      <SiteHeader variant="create" />

      <main className="workspace">
        <div className="hero-glow glow-left" /><div className="hero-glow glow-right" />
        <div className="container workspace-inner">
          <div className="workspace-head">
            <span className="eyebrow">AI STICKER MAKER</span>
            <h1>클립을 스티커로 만들어요</h1>
            <p>치지직 클립 주소를 넣고, 스티커로 남길 구간만 골라주세요.</p>
          </div>

          <ol className="workspace-steps" aria-label="진행 단계">
            {WORKSPACE_STEPS.map((label, index) => (
              <li key={label} className={index < workspaceStep ? 'done' : index === workspaceStep ? 'active' : ''}>
                <span>{index < workspaceStep ? <Icon name="check" size={13} /> : index + 1}</span>
                {label}
              </li>
            ))}
          </ol>

          <div className={`generator-card workspace-card ${status}`}>
            <div className="generator-topline">
              <span className="window-dots"><i /><i /><i /></span>
              <span className="secure-note"><Icon name="shield" size={15} /> 처리 후 바로 삭제해요</span>
            </div>

            {status === 'idle' && (
              <ClipUrlForm
                url={url}
                onUrlChange={handleUrlChange}
                mode={mode}
                setMode={setMode}
                onSubmit={startMaking}
                externalError={error}
              />
            )}

            {status === 'loading' && (
              <div className="process-state" aria-live="polite">
                <div className="process-head">
                  <div>
                    <span className="eyebrow">AI STICKER MAKER</span>
                    <h3>클립 미리보기를 준비하는 중</h3>
                  </div>
                  <strong>{progress}%</strong>
                </div>
                <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
                <p className="loading-hint">치지직 서버에서 클립을 내려받고 미리보기를 만들고 있어요.</p>
              </div>
            )}

            {status === 'trimming' && (
              <div className="trim-state" aria-live="polite">
                <div className="trim-video-wrap">
                  <video ref={videoRef} key={previewUrl} src={mediaUrl(previewUrl)} className="trim-video" controls playsInline />
                </div>

                <div className="trim-range-row">
                  <span className="trim-label">스티커로 만들 구간을 골라주세요</span>
                  <span className="trim-readout">{range.start.toFixed(1)}초 → {range.end.toFixed(1)}초 · {(range.end - range.start).toFixed(1)}초</span>
                </div>
                <div className="trim-range">
                  <div className="trim-range-track">
                    <span
                      className="trim-range-fill"
                      style={{
                        left: `${duration ? (range.start / duration) * 100 : 0}%`,
                        width: `${duration ? ((range.end - range.start) / duration) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <input type="range" className="trim-range-input" min={0} max={duration || 0} step={0.1} value={range.start} onChange={handleStartChange} aria-label="시작 시간" />
                  <input type="range" className="trim-range-input" min={0} max={duration || 0} step={0.1} value={range.end} onChange={handleEndChange} aria-label="종료 시간" />
                </div>
                <p className="trim-hint">최대 5초까지 선택할 수 있어요.</p>

                <div className={`quota-note ${user?.quotaRemaining === 0 ? 'is-empty' : ''}`}>
                  {authLoading ? (
                    <span>로그인 상태를 확인하고 있어요.</span>
                  ) : user ? (
                    <>
                      <span>남은 생성</span>
                      <strong>{user.quotaRemaining} / {user.quotaLimit}회</strong>
                    </>
                  ) : (
                    <span>생성 버튼을 누르면 Google 로그인 후 이어서 만들 수 있어요.</span>
                  )}
                </div>

                <div className="mode-row">
                  <div><strong>어떻게 만들까요?</strong></div>
                  <div className="mode-switch" role="group" aria-label="스티커 스타일">
                    <button type="button" className={stickerStyle === 'character' ? 'active' : ''} onClick={() => setStickerStyle('character')}>
                      <Icon name="wand" size={16} /> 캐릭터로 재창작
                    </button>
                    <button type="button" className={stickerStyle === 'original' ? 'active' : ''} onClick={() => setStickerStyle('original')}>
                      <Icon name="image" size={16} /> 원본에 가깝게
                    </button>
                  </div>
                </div>

                {error && <p className="trim-error">{error}</p>}

                <div className="trim-actions">
                  <button type="button" className="trim-confirm" onClick={handleConfirmTrim} disabled={authLoading || user?.quotaRemaining === 0}>
                    {user ? '이 구간으로 만들기' : 'Google 로그인하고 만들기'} <Icon name="arrow" size={18} />
                  </button>
                </div>
              </div>
            )}

            {status === 'processing' && (
              <div className="process-state" aria-live="polite">
                <div className="process-head">
                  <div>
                    <span className="eyebrow">AI STICKER MAKER</span>
                    <h3>{activeStep < 2 ? '표정과 동작을 분석하는 중' : 'OGQ 스티커로 다듬는 중'}</h3>
                  </div>
                  <strong>{progress}%</strong>
                </div>
                <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
                <div className="process-steps">
                  {['클립 불러오기', '표정·동작 분석', '배경·용량 최적화'].map((label, index) => (
                    <div key={label} className={index < activeStep || progress === 100 ? 'done' : index === activeStep ? 'active' : ''}>
                      <span>{index < activeStep || progress === 100 ? <Icon name="check" size={14} /> : index + 1}</span>
                      {label}
                    </div>
                  ))}
                </div>
                <div className="scan-preview">
                  <div className="scan-image"><img src={stickerAssets.surprised} alt="분석 중인 깜짝 반응 스티커" /><i /></div>
                  <div className="scan-lines"><span /><span /><span /><span /><span /><span /><span /><span /></div>
                </div>
              </div>
            )}

            {status === 'complete' && result && (
              <div className="complete-state" aria-live="polite">
                <div className="complete-copy">
                  <span className="complete-check"><Icon name="check" size={22} /></span>
                  <div><strong>스티커가 완성됐어요!</strong><span>OGQ 업로드 규격으로 준비했습니다.</span></div>
                </div>
                <div className="result-box">
                  <div className={`result-sticker ${isAnimated ? 'is-animated' : ''}`}>
                    <img src={mediaUrl(result.stickerUrl)} alt="완성된 스티커" />
                  </div>
                  <div className="result-meta">
                    <span>{result.emotion}</span>
                    <strong>{result.width} × {result.height}px</strong>
                    <small>{Math.round(result.bytes / 1024)}KB</small>
                  </div>
                </div>
                {downloadError && <p className="result-error">{downloadError}</p>}
                <div className="result-actions">
                  <button type="button" className="download-btn" onClick={handleDownload} disabled={downloading}>
                    <Icon name="download" size={19} /> {downloading ? '다운로드 준비 중…' : '스티커 다운로드'}
                  </button>
                  <button type="button" onClick={handleConfirmTrim} disabled={user?.quotaRemaining === 0}><Icon name="wand" size={18} /> 다시 만들기</button>
                  <button type="button" onClick={reset}><Icon name="refresh" size={18} /> 다른 클립 만들기</button>
                </div>
              </div>
            )}
          </div>

          <p className="workspace-note">CLIPY는 네이버, 치지직, OGQ와 제휴하거나 공식 운영되는 서비스가 아닙니다.</p>
        </div>
      </main>
    </div>
  )
}
