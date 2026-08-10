import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'

const STEP = 0.1
const BIG_STEP = 1

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const percent = (value, total) => (total > 0 ? clamp((value / total) * 100, 0, 100) : 0)
const round = (value) => Math.round(value * 100) / 100

/**
 * 구간 선택용 자체 플레이어. 구간 제약(최소·최대 길이)은 부모가 소유하므로
 * 여기서는 포인터/키보드 입력을 초 단위로 바꿔 그대로 올려보내고,
 * 화면에는 항상 부모가 내려준 range를 그린다.
 */
export default function ClipPlayer({ src, duration, range, onStartChange, onEndChange }) {
  const videoRef = useRef(null)
  const timelineRef = useRef(null)
  const draggingRef = useRef(null)
  const rafRef = useRef(0)
  const seekTargetRef = useRef(null)

  const [currentTime, setCurrentTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [metaDuration, setMetaDuration] = useState(0)

  const total = metaDuration || duration || 0

  // 드래그 중 pointermove마다 currentTime을 대입하면 스크럽이 버벅이므로
  // 목표 시각만 모아두고 프레임당 한 번만 반영한다.
  const applySeek = useCallback(() => {
    rafRef.current = 0
    const video = videoRef.current
    const target = seekTargetRef.current
    seekTargetRef.current = null
    if (!video || target == null) return
    video.currentTime = target
  }, [])

  const scheduleSeek = useCallback((seconds) => {
    seekTargetRef.current = seconds
    setCurrentTime(seconds)
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(applySeek)
  }, [applySeek])

  const flushSeek = useCallback(() => {
    if (!rafRef.current) return
    cancelAnimationFrame(rafRef.current)
    applySeek()
  }, [applySeek])

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  // src가 바뀌면 video가 재마운트되므로 표시 상태를 초기화한다.
  useEffect(() => {
    setCurrentTime(0)
    setPlaying(false)
    setMetaDuration(0)
  }, [src])

  // 재마운트된 video는 muted가 false로 돌아가므로 src도 의존성에 넣는다.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted, src])

  const timeFromClientX = (clientX) => {
    const rect = timelineRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return 0
    return clamp((clientX - rect.left) / rect.width, 0, 1) * total
  }

  const emit = (which, seconds) => {
    if (which === 'start') onStartChange(seconds)
    else onEndChange(seconds)
  }

  const handlePointerDown = (which) => (event) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    // pointerdown의 기본 동작을 막으면 포커스도 함께 막히므로 직접 옮긴다.
    // 잡은 핸들을 그대로 화살표 키로 미세 조정할 수 있어야 한다.
    event.currentTarget.focus()
    draggingRef.current = which
  }

  const handlePointerMove = (which) => (event) => {
    if (draggingRef.current !== which) return
    const seconds = timeFromClientX(event.clientX)
    emit(which, seconds)
    scheduleSeek(seconds)
  }

  const handlePointerEnd = (event) => {
    if (!draggingRef.current) return
    draggingRef.current = null
    flushSeek()
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleTrackPointerDown = (event) => {
    if (draggingRef.current) return
    scheduleSeek(timeFromClientX(event.clientX))
  }

  const handleKeyDown = (which) => (event) => {
    const step = event.shiftKey ? BIG_STEP : STEP
    const value = which === 'start' ? range.start : range.end
    let next
    if (event.key === 'ArrowLeft') next = value - step
    else if (event.key === 'ArrowRight') next = value + step
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = total
    else return

    event.preventDefault()
    const seconds = round(clamp(next, 0, total))
    emit(which, seconds)
    scheduleSeek(seconds)
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      if (video.currentTime < range.start || video.currentTime >= range.end) {
        video.currentTime = range.start
      }
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  const handleLoadedMetadata = (event) => {
    const value = event.currentTarget.duration
    setMetaDuration(Number.isFinite(value) ? value : 0)
  }

  const handleTimeUpdate = (event) => {
    const video = event.currentTarget
    if (!video.paused && range.end > 0 && video.currentTime >= range.end) {
      video.pause()
      video.currentTime = range.end
      setCurrentTime(range.end)
      return
    }
    setCurrentTime(video.currentTime)
  }

  const startPercent = percent(range.start, total)
  const endPercent = percent(range.end, total)

  return (
    <div className="clip-player">
      <div className="clip-player-stage" onContextMenu={(event) => event.preventDefault()}>
        <video
          key={src}
          ref={videoRef}
          src={src}
          playsInline
          preload="auto"
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onSeeked={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <button
          type="button"
          className={`clip-player-bigplay ${playing ? '' : 'is-visible'}`}
          onClick={togglePlay}
          aria-label="재생"
          tabIndex={playing ? -1 : 0}
          aria-hidden={playing}
        >
          <Icon name="play" size={26} />
        </button>
      </div>

      <div className="clip-player-bar">
        <button
          type="button"
          className="clip-player-btn"
          onClick={togglePlay}
          aria-label={playing ? '일시정지' : '재생'}
        >
          <Icon name={playing ? 'pause' : 'play'} size={18} />
        </button>

        <div className="clip-player-timeline" ref={timelineRef} onPointerDown={handleTrackPointerDown}>
          <div className="clip-player-track" />
          <div
            className="clip-player-selection"
            style={{ left: `${startPercent}%`, width: `${Math.max(endPercent - startPercent, 0)}%` }}
          />
          <div className="clip-player-playhead" style={{ left: `${percent(currentTime, total)}%` }} />
          <button
            type="button"
            className="clip-player-handle is-start"
            style={{ left: `${startPercent}%` }}
            role="slider"
            tabIndex={0}
            aria-label="시작 시간"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={range.start}
            aria-valuetext={`${range.start.toFixed(1)}초`}
            onPointerDown={handlePointerDown('start')}
            onPointerMove={handlePointerMove('start')}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onKeyDown={handleKeyDown('start')}
          />
          <button
            type="button"
            className="clip-player-handle is-end"
            style={{ left: `${endPercent}%` }}
            role="slider"
            tabIndex={0}
            aria-label="종료 시간"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={range.end}
            aria-valuetext={`${range.end.toFixed(1)}초`}
            onPointerDown={handlePointerDown('end')}
            onPointerMove={handlePointerMove('end')}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onKeyDown={handleKeyDown('end')}
          />
        </div>

        <button
          type="button"
          className="clip-player-btn"
          onClick={() => setMuted((value) => !value)}
          aria-label={muted ? '음소거 해제' : '음소거'}
          aria-pressed={muted}
        >
          <Icon name={muted ? 'mute' : 'volume'} size={18} />
        </button>

        <span className="clip-player-time">{currentTime.toFixed(1)} / {total.toFixed(1)}초</span>
      </div>
    </div>
  )
}
