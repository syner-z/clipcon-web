export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export function mediaUrl(path) {
  if (!path) return path
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new Error('서버에 연결하지 못했어요.')
  }

  let body = null
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const message = body?.error?.message || '요청을 처리하지 못했어요.'
    throw new Error(message)
  }

  return body
}

export function createClip(url) {
  return request('/clips', {
    method: 'POST',
    body: JSON.stringify({ url }),
  })
}

export function createSticker(clipId, { start, end, mode }) {
  return request(`/clips/${clipId}/stickers`, {
    method: 'POST',
    body: JSON.stringify({ start, end, mode }),
  })
}

export function getJob(jobId) {
  return request(`/jobs/${jobId}`, { method: 'GET' })
}

export function pollJob(jobId, { onProgress, signal, interval = 1000 } = {}) {
  return new Promise((resolve, reject) => {
    let stopped = false

    const onAbort = () => {
      stopped = true
      reject(new Error('작업이 취소됐어요.'))
    }

    if (signal) {
      if (signal.aborted) {
        onAbort()
        return
      }
      signal.addEventListener('abort', onAbort)
    }

    const cleanup = () => {
      if (signal) signal.removeEventListener('abort', onAbort)
    }

    const tick = async () => {
      if (stopped) return
      try {
        const job = await getJob(jobId)
        if (stopped) return

        onProgress?.(job)

        if (job.status === 'succeeded') {
          cleanup()
          resolve(job.result)
          return
        }

        if (job.status === 'failed') {
          cleanup()
          reject(new Error(job.error?.message || '작업이 실패했어요.'))
          return
        }

        setTimeout(tick, interval)
      } catch (error) {
        if (stopped) return
        cleanup()
        reject(error)
      }
    }

    tick()
  })
}
