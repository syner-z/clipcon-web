import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'

const STEP = 0.1
const BIG_STEP = 1

// 구간 끝에서 멈출 때 브라우저는 요청한 시각의 바로 앞 프레임으로 스냅한다.
// 그래서 currentTime이 end보다 근소하게 작아지고, 그대로 두면 "끝에 닿았는가"
// 판정이 빗나가 다시 재생을 눌러도 제자리에서 멈춘 것처럼 보인다.
const END_EPSILON = 0.05

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const percent = (value, total) => (total > 0 ? clamp((value / total) * 100, 0, 100) : 0)
const round = (value) => Math.round(value * 100) / 100

/**
 * 구간 선택용 자체 플레이어. 구간 길이는 고정이고 위치만 옮긴다.
 * 길이·경계 제약은 부모가 소유하므로 여기서는 포인터/키보드 입력을
 * 시작 시각(초)으로 바꿔 올려보내고, 화면에는 항상 부모가 내려준 range를 그린다.
 */
export default function ClipPlayer({ src, duration, range, onRangeMove }) {
  const videoRef = useRef(null)
  const timelineRef = useRef(null)
  const draggingRef = useRef(false)
  const grabOffsetRef = useRef(0)
  const rafRef = useRef(0)
  const seekTargetRef = useRef(null)
  const endedRef = useRef(false)

  const [currentTime, setCurrentTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [metaDuration, setMetaDuration] = useState(0)

  const total = metaDuration || duration || 0
  const segment = Math.max(range.end - range.start, 0)
  const maxStart = Math.max(total - segment, 0)

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
    endedRef.current = false
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
    endedRef.current = false
  }, [src])

  // 구간을 옮기면 이전에 도달했던 끝은 더 이상 의미가 없다.
  useEffect(() => {
    endedRef.current = false
  }, [range.start, range.end])

  // 재마운트된 video는 muted가 false로 돌아가므로 src도 의존성에 넣는다.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted, src])

  const timeFromClientX = (clientX) => {
    const rect = timelineRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return 0
    return clamp((clientX - rect.left) / rect.width, 0, 1) * total
  }

  const moveTo = (rawStart) => {
    const next = clamp(rawStart, 0, maxStart)
    onRangeMove(next)
    scheduleSeek(next)
  }

  const handleWindowPointerDown = (event) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    // pointerdown의 기본 동작을 막으면 포커스도 함께 막히므로 직접 옮긴다.
    // 잡은 구간을 그대로 화살표 키로 미세 조정할 수 있어야 한다.
    event.currentTarget.focus()
    // 잡은 지점과 구간 시작의 간격을 유지해야 구간이 커서로 튀지 않는다.
    grabOffsetRef.current = timeFromClientX(event.clientX) - range.start
    draggingRef.current = true
  }

  const handleWindowPointerMove = (event) => {
    if (!draggingRef.current) return
    moveTo(timeFromClientX(event.clientX) - grabOffsetRef.current)
  }

  const handleWindowPointerEnd = (event) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    flushSeek()
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleTrackPointerDown = (event) => {
    if (draggingRef.current) return
    scheduleSeek(timeFromClientX(event.clientX))
  }

  const handleWindowKeyDown = (event) => {
    const step = event.shiftKey ? BIG_STEP : STEP
    let next
    if (event.key === 'ArrowLeft') next = range.start - step
    else if (event.key === 'ArrowRight') next = range.start + step
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = maxStart
    else return

    event.preventDefault()
    moveTo(round(next))
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (!video.paused) {
      video.pause()
      return
    }
    // 구간 끝에 멈춰 있으면 되감아야 다시 볼 수 있다. 프레임 스냅 때문에
    // currentTime 비교만으로는 놓치는 경우가 있어 도달 여부를 따로 들고 있는다.
    if (endedRef.current || video.currentTime < range.start || video.currentTime >= range.end - END_EPSILON) {
      video.currentTime = range.start
      setCurrentTime(range.start)
    }
    endedRef.current = false
    video.play().catch(() => {})
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
      endedRef.current = true
      return
    }
    setCurrentTime(video.currentTime)
  }

  const startPercent = percent(range.start, total)
  const widthPercent = Math.max(percent(range.end, total) - startPercent, 0)
  // 라벨은 렌더마다 다시 계산해야 하므로 ref가 아니라 상태에서 끌어온다.
  const atSegmentEnd = !playing && total > 0 && currentTime >= range.end - END_EPSILON

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
          aria-label={atSegmentEnd ? '다시 재생' : '재생'}
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
          <div className="clip-player-playhead" style={{ left: `${percent(currentTime, total)}%` }} />
          <button
            type="button"
            className="clip-player-window"
            style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
            role="slider"
            tabIndex={0}
            aria-label="구간 위치"
            aria-valuemin={0}
            aria-valuemax={round(maxStart)}
            aria-valuenow={range.start}
            aria-valuetext={`${range.start.toFixed(1)}초부터 ${range.end.toFixed(1)}초까지`}
            onPointerDown={handleWindowPointerDown}
            onPointerMove={handleWindowPointerMove}
            onPointerUp={handleWindowPointerEnd}
            onPointerCancel={handleWindowPointerEnd}
            onKeyDown={handleWindowKeyDown}
          >
            <i /><i /><i />
          </button>
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
