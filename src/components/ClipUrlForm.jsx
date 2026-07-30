import { useState } from 'react'
import Icon from './Icon.jsx'

const SAMPLE_URL = 'https://chzzk.naver.com/clips/clipy-demo-2407'

/**
 * 치지직 클립 URL을 검증해 부모에게 넘겨주는 공용 폼.
 * 랜딩에서는 onSubmit이 /create로 이동시키고, 작업 페이지에서는 실제 변환을 시작한다.
 * 입력값은 부모가 소유한다 — 작업 페이지에서 이 폼은 처리 중 언마운트되므로,
 * 여기에 두면 변환 실패 후 되돌아왔을 때 사용자가 입력한 주소가 사라진다.
 */
export default function ClipUrlForm({
  url,
  onUrlChange,
  mode,
  setMode,
  onSubmit,
  externalError = '',
  submitLabel = '스티커 만들기',
}) {
  const [error, setError] = useState('')

  const shownError = error || externalError

  const handleSubmit = (event) => {
    event.preventDefault()

    const trimmed = url.trim()
    if (!trimmed) {
      setError('치지직 클립 주소를 입력해 주세요.')
      return
    }

    let parsed
    try {
      parsed = new URL(trimmed)
    } catch {
      setError('올바른 URL 형식인지 확인해 주세요.')
      return
    }

    if (!parsed.hostname.endsWith('chzzk.naver.com')) {
      setError('chzzk.naver.com의 클립 주소만 사용할 수 있어요.')
      return
    }

    setError('')
    onSubmit(trimmed)
  }

  const handleChange = (value) => {
    setError('')
    onUrlChange(value)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mode-row">
        <div>
          <strong>어떤 스티커를 만들까요?</strong>
        </div>
        <div className="mode-switch" role="group" aria-label="스티커 종류">
          <button type="button" className={mode === 'animated' ? 'active' : ''} onClick={() => setMode('animated')} disabled title="움직이는 스티커는 곧 추가돼요">
            <Icon name="motion" size={16} /> 움직이는 <em className="soon-chip">곧 추가돼요</em>
          </button>
          <button type="button" className={mode === 'static' ? 'active' : ''} onClick={() => setMode('static')}>
            <Icon name="image" size={16} /> 멈춰있는
          </button>
        </div>
      </div>

      <label className={`url-field ${shownError ? 'has-error' : ''}`}>
        <Icon name="link" size={21} />
        <input
          value={url}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="치지직 클립 URL을 붙여 넣어주세요"
          aria-label="치지직 클립 URL"
        />
        <button type="submit">{submitLabel} <Icon name="arrow" size={18} /></button>
      </label>
      <div className="field-foot">
        <span className={shownError ? 'error-text' : ''}>{shownError || '공개 클립만 변환할 수 있어요.'}</span>
        <button type="button" className="sample-link" onClick={() => handleChange(SAMPLE_URL)}>예시 주소 넣기</button>
      </div>
    </form>
  )
}
