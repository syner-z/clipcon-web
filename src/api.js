export const API_BASE = import.meta.env.VITE_API_BASE || '/api'

// 미디어 경로(예: /api/media/xyz.png)는 API_BASE와 같은 /api 접두사를 이미 포함하고 있다.
// API_BASE에서 그 접두사를 뗀 오리진만 붙여야 경로가 중복되지 않는다.
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '')

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

export function mediaUrl(path) {
  if (!path) return path
  if (/^https?:\/\//i.test(path)) return path
  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`
}

// 미디어는 API 서버(다른 오리진일 수 있음)에서 오기 때문에 <a download>가 무시되고 새 창이 열린다.
// blob으로 받아서 같은 오리진의 object URL로 내려받게 한다.
export async function downloadMedia(path, filename) {
  let objectUrl
  try {
    const response = await fetch(mediaUrl(path))
    if (!response.ok) throw new Error('bad status')
    objectUrl = URL.createObjectURL(await response.blob())
  } catch {
    throw new Error('스티커를 내려받지 못했어요.')
  }

  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: 'same-origin',
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
    const code = body?.error?.code || null
    throw new ApiError(message, code, response.status)
  }

  return body
}

export function createClip(url) {
  return request('/clips', {
    method: 'POST',
    body: JSON.stringify({ url }),
  })
}

export function createSticker(clipId, { start, end, mode, withCaption }) {
  return request(`/clips/${clipId}/stickers`, {
    method: 'POST',
    body: JSON.stringify({ start, end, mode, withCaption }),
  })
}

export function getJob(jobId) {
  return request(`/jobs/${jobId}`, { method: 'GET' })
}

// 로그인 상태 확인. 미로그인(401)은 정상 상태이므로 에러 대신 null을 돌려준다.
export async function getMe() {
  try {
    return await request('/auth/me', { method: 'GET' })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}

export function logout() {
  return request('/auth/logout', { method: 'POST' })
}

export function loginUrl(next = '/') {
  return `${API_BASE}/auth/google/login?next=${encodeURIComponent(next)}`
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
