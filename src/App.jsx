import { useEffect, useRef, useState } from 'react'

const SAMPLE_URL = 'https://chzzk.naver.com/clips/clipy-demo-2407'

const stickerAssets = {
  victory: '/assets/jelly-sticker.png',
  laugh: '/assets/stickers/laugh.png',
  surprised: '/assets/stickers/surprised.png',
  love: '/assets/stickers/love.png',
  cry: '/assets/stickers/cry.png',
  angry: '/assets/stickers/angry.png',
  think: '/assets/stickers/think.png',
}

function Icon({ name, size = 20, strokeWidth = 2, className = '' }) {
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    link: <><path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" /><path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15" /></>,
    play: <path d="m8 5 11 7-11 7V5Z" />,
    spark: <><path d="m12 3-1.2 4.3a5 5 0 0 1-3.5 3.5L3 12l4.3 1.2a5 5 0 0 1 3.5 3.5L12 21l1.2-4.3a5 5 0 0 1 3.5-3.5L21 12l-4.3-1.2a5 5 0 0 1-3.5-3.5L12 3Z" /></>,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    refresh: <><path d="M20 7h-6V1" /><path d="M20 7a9 9 0 1 0 1 7" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>,
    shield: <><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z" /><path d="m9 12 2 2 4-4" /></>,
    wand: <><path d="m15 4 5 5L8 21l-5-5L15 4Z" /><path d="m6 14 4 4" /><path d="M6 3v4" /><path d="M4 5h4" /><path d="M19 15v4" /><path d="M17 17h4" /></>,
    motion: <><path d="M3 8h10" /><path d="M3 12h7" /><path d="M3 16h4" /><path d="m14 6 7 6-7 6V6Z" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></>,
  }

  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function Logo() {
  return (
    <a className="logo" href="#top" aria-label="CLIPY 홈">
      <span className="logo-mark"><span /></span>
      <span>CLIPY</span>
      <em>BETA</em>
    </a>
  )
}

const specs = [
  ['스티커 이미지', 'PNG / GIF · 740 × 640px', '24개'],
  ['메인 이미지', '240 × 240px', '1개'],
  ['탭 이미지', '96 × 74px', '1개'],
  ['파일 설정', 'RGB · 72dpi 이상', '각 1MB 이하'],
]

const faqItems = [
  {
    question: '치지직 클립 주소만 있으면 되나요?',
    answer: '네. 공개된 치지직 클립 URL을 붙여 넣으면 인상적인 표정과 움직임이 있는 구간을 분석해 스티커 후보로 정리하는 흐름입니다.',
  },
  {
    question: '움직이는 스티커도 OGQ 규격에 맞나요?',
    answer: '네. 움직이는 스티커는 사진 한 장이 아니라 여러 프레임이 들어 있는 GIF 24개로 구성합니다. 각 GIF는 740×640px, 최대 3초, 100프레임 이하, 1MB 이하 기준을 반영합니다.',
  },
  {
    question: '만든 스티커를 바로 판매할 수 있나요?',
    answer: '다운로드한 파일을 OGQ 크리에이터 스튜디오에 직접 등록하고 심사를 요청해야 합니다. 최종 승인 여부는 OGQ의 심사 기준에 따라 결정됩니다.',
  },
  {
    question: '클립과 캐릭터의 저작권은 어떻게 되나요?',
    answer: '본인에게 사용 권한이 있는 영상만 이용해야 합니다. 타인의 얼굴, 캐릭터, 방송 장면을 활용할 때는 초상권과 저작권 등 필요한 권리를 먼저 확인해 주세요.',
  },
  {
    question: '네이버나 치지직의 공식 서비스인가요?',
    answer: '아니요. CLIPY는 치지직·네이버·OGQ와 제휴하거나 공식 운영되는 서비스가 아닌 독립적인 크리에이터 도구입니다.',
  },
]

function Generator({ mode, setMode }) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [error, setError] = useState('')
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const startMaking = (event) => {
    event?.preventDefault()
    timers.current.forEach(clearTimeout)
    timers.current = []

    if (!url.trim()) {
      setError('치지직 클립 주소를 입력해 주세요.')
      return
    }

    let parsed
    try {
      parsed = new URL(url.trim())
    } catch {
      setError('올바른 URL 형식인지 확인해 주세요.')
      return
    }

    if (!parsed.hostname.endsWith('chzzk.naver.com')) {
      setError('chzzk.naver.com의 클립 주소만 사용할 수 있어요.')
      return
    }

    setError('')
    setStatus('processing')
    setProgress(8)
    setActiveStep(0)

    const timeline = [
      [560, 28, 1],
      [1250, 52, 1],
      [1950, 74, 2],
      [2700, 92, 2],
      [3400, 100, 3],
    ]

    timeline.forEach(([delay, value, step]) => {
      timers.current.push(setTimeout(() => {
        setProgress(value)
        setActiveStep(step)
        if (value === 100) {
          timers.current.push(setTimeout(() => setStatus('complete'), 320))
        }
      }, delay))
    })
  }

  const reset = () => {
    timers.current.forEach(clearTimeout)
    setStatus('idle')
    setProgress(0)
    setActiveStep(0)
  }

  const isAnimated = mode === 'animated'
  const resultAsset = isAnimated ? '/assets/clipy-ogq-sticker-sample.gif' : '/assets/clipy-ogq-sticker-sample.png'
  const resultFilename = isAnimated ? 'CLIPY_SAMPLE_01.gif' : 'CLIPY_SAMPLE_01.png'
  const resultDownloadName = isAnimated ? 'clipy-ogq-animated-sticker-sample.gif' : 'clipy-ogq-static-sticker-sample.png'

  return (
    <div className={`generator-card ${status}`} id="make">
      <div className="generator-topline">
        <span className="window-dots"><i /><i /><i /></span>
        <span className="secure-note"><Icon name="shield" size={15} /> 클립은 저장하지 않아요</span>
      </div>

      {status === 'idle' && (
        <form onSubmit={startMaking} noValidate>
          <div className="mode-row">
            <div>
              <strong>어떤 스티커를 만들까요?</strong>
              <span>{mode === 'animated' ? '여러 프레임이 들어 있는 GIF로 만들어요' : '한 장의 투명 PNG로 만들어요'}</span>
            </div>
            <div className="mode-switch" role="group" aria-label="스티커 종류">
              <button type="button" className={mode === 'animated' ? 'active' : ''} onClick={() => setMode('animated')}>
                <Icon name="motion" size={16} /> 움직이는
              </button>
              <button type="button" className={mode === 'static' ? 'active' : ''} onClick={() => setMode('static')}>
                <Icon name="image" size={16} /> 멈춰있는
              </button>
            </div>
          </div>

          <label className={`url-field ${error ? 'has-error' : ''}`}>
            <Icon name="link" size={21} />
            <input
              value={url}
              onChange={(event) => { setUrl(event.target.value); setError('') }}
              placeholder="치지직 클립 URL을 붙여 넣어주세요"
              aria-label="치지직 클립 URL"
            />
            <button type="submit" onClick={startMaking}>스티커 만들기 <Icon name="arrow" size={18} /></button>
          </label>
          <div className="field-foot">
            <span className={error ? 'error-text' : ''}>{error || '공개 클립만 변환할 수 있어요.'}</span>
            <button type="button" className="sample-link" onClick={() => { setUrl(SAMPLE_URL); setError('') }}>예시 주소 넣기</button>
          </div>
        </form>
      )}

      {status === 'processing' && (
        <div className="process-state" aria-live="polite">
          <div className="process-head">
            <div>
              <span className="eyebrow">AI STICKER MAKER</span>
              <h3>{activeStep < 2 ? '클립의 하이라이트를 찾는 중' : 'OGQ 스티커로 다듬는 중'}</h3>
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

      {status === 'complete' && (
        <div className="complete-state" aria-live="polite">
          <div className="complete-copy">
            <span className="complete-check"><Icon name="check" size={22} /></span>
            <div><strong>스티커가 완성됐어요!</strong><span>OGQ 업로드 규격으로 준비했습니다.</span></div>
          </div>
          <div className="result-box">
            <div className={`result-sticker ${isAnimated ? 'is-animated' : ''}`}>
              <img src={resultAsset} alt={isAnimated ? '여러 프레임으로 재생되는 GIF 스티커 샘플' : '완성된 정지형 PNG 스티커 샘플'} />
              {isAnimated && <span className="playing-badge"><i /> GIF · 21F</span>}
            </div>
            <div className="result-meta">
              <span>{resultFilename}</span>
              <strong>740 × 640px</strong>
              <small>{isAnimated ? 'GIF · 21프레임 · 2.63초 · 549KB' : '투명 배경 · PNG · 228KB'}</small>
            </div>
          </div>
          <div className="result-actions">
            <a href={resultAsset} download={resultDownloadName} className="download-btn">
              <Icon name="download" size={19} /> 샘플 {isAnimated ? 'GIF' : 'PNG'} 다운로드
            </a>
            <button type="button" onClick={reset}><Icon name="refresh" size={18} /> 다른 클립 만들기</button>
          </div>
          <p className="demo-note">현재 랜딩 데모에서는 샘플 결과물을 제공합니다.</p>
        </div>
      )}
    </div>
  )
}

function HeroVisual({ mode }) {
  const isAnimated = mode === 'animated'
  return (
    <div className="hero-visual" aria-label="클립이 스티커로 변환되는 예시">
      <div className="visual-orbit orbit-one" />
      <div className="visual-orbit orbit-two" />
      <div className="clip-window">
        <div className="clip-bar"><span><i /> CHZZK CLIP</span><small>00:03</small></div>
        <div className="clip-scene">
          <div className="clip-grid" />
          <div className="clip-avatar"><img src={stickerAssets.angry} alt="" /></div>
          <span className="live-pill">LIVE MOMENT</span>
          <div className="timeline"><i /><i /><i /><i /><i /><i /><b /></div>
        </div>
      </div>

      <div className="convert-line"><span><Icon name="spark" size={18} /></span></div>

      <div className="sticker-window">
        <div className="sticker-window-head">
          <div><span>OGQ STICKER</span><strong>완성 미리보기</strong></div>
          <i className="status-dot" />
        </div>
        <div className="checkerboard">
          <div className={`hero-sticker ${isAnimated ? 'is-animated' : ''}`}>
            <img src={isAnimated ? '/assets/clipy-ogq-sticker-sample.gif' : '/assets/clipy-ogq-sticker-sample.png'} alt={isAnimated ? '여러 프레임으로 재생되는 오리지널 젤리 캐릭터 GIF 스티커' : '오리지널 젤리 캐릭터 PNG 스티커'} />
            {isAnimated && <i className="motion-ring" />}
          </div>
        </div>
        <div className="sticker-window-foot"><span>740 × 640</span><span>{isAnimated ? 'GIF · 2.63 sec · 21 frames' : 'PNG · 228KB'}</span></div>
      </div>

      <span className="floating-chip chip-a"><Icon name="check" size={14} /> 배경 제거</span>
      <span className="floating-chip chip-b"><Icon name="layers" size={14} /> OGQ 규격</span>
      <span className="floating-chip chip-c"><i /> 24 STICKERS</span>
    </div>
  )
}

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <div className="faq-list">
      {faqItems.map((item, index) => (
        <div className={`faq-item ${open === index ? 'open' : ''}`} key={item.question}>
          <button type="button" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}>
            <span><em>{String(index + 1).padStart(2, '0')}</em>{item.question}</span>
            <i><Icon name="chevron" size={20} /></i>
          </button>
          <div className="faq-answer"><p>{item.answer}</p></div>
        </div>
      ))}
    </div>
  )
}

function App() {
  const [mode, setMode] = useState('animated')

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="site-shell" id="top">
      <header className="site-header">
        <div className="header-inner">
          <Logo />
          <nav aria-label="주요 메뉴">
            <a href="#how">만드는 법</a>
            <a href="#features">기능</a>
            <a href="#specs">OGQ 규격</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a className="header-cta" href="#make">무료로 만들기 <Icon name="arrow" size={17} /></a>
        </div>
      </header>

      <main>
        <section className="hero section-pad">
          <div className="hero-glow glow-left" /><div className="hero-glow glow-right" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="hero-kicker"><span><i /> NEW</span> 치지직 클립, 이제 스티커로 소장하세요</div>
              <h1>그 순간을,<br /><span>움직이는 스티커로.</span></h1>
              <p className="hero-desc">치지직 클립 링크 하나면 충분해요.<br className="desktop-break" /> 웃긴 표정과 결정적 움직임을 찾아 네이버 OGQ 규격으로 완성해 드려요.</p>
              <div className="hero-points">
                <span><Icon name="check" size={15} /> AI 하이라이트 포착</span>
                <span><Icon name="check" size={15} /> 투명 배경 자동 처리</span>
                <span><Icon name="check" size={15} /> OGQ 규격 자동 적용</span>
              </div>
              <Generator mode={mode} setMode={setMode} />
            </div>
            <HeroVisual mode={mode} />
          </div>
        </section>

        <div className="trust-strip" aria-label="지원 기능">
          <div className="ticker-track">
            {[0, 1].map((group) => (
              <div className="ticker-group" key={group} aria-hidden={group === 1}>
                <span>CHZZK CLIP</span><i />
                <span>AI MOTION PICK</span><i />
                <span>PNG / ANIMATED GIF</span><i />
                <span>OGQ READY</span><i />
                <span>3 SEC ANIMATION</span><i />
              </div>
            ))}
          </div>
        </div>

        <section className="how-section section-pad" id="how">
          <div className="container">
            <div className="section-heading reveal">
              <span className="section-label">HOW IT WORKS</span>
              <h2>링크 한 줄이<br /><em>스티커 24개</em>가 되기까지</h2>
              <p>복잡한 영상 편집도, 어려운 규격 계산도 필요 없어요.</p>
            </div>
            <div className="steps-grid">
              <article className="step-card reveal">
                <div className="step-number">01</div>
                <div className="step-icon"><Icon name="link" size={27} /></div>
                <h3>클립 링크 붙여넣기</h3>
                <p>스티커로 만들고 싶은 공개 치지직 클립의 주소를 복사해 넣어주세요.</p>
                <div className="mini-url"><i /> chzzk.naver.com/clips/...</div>
              </article>
              <article className="step-card featured reveal">
                <div className="step-number">02</div>
                <div className="step-icon"><Icon name="wand" size={28} /></div>
                <h3>AI가 베스트 컷 포착</h3>
                <p>표정, 동작, 타이밍을 분석해 채팅에서 가장 잘 통할 순간을 찾아요.</p>
                <div className="emotion-meter">
                  <span /><span /><span /><span /><span /><span /><span /><span /><i />
                </div>
              </article>
              <article className="step-card reveal">
                <div className="step-number">03</div>
                <div className="step-icon"><Icon name="download" size={27} /></div>
                <h3>OGQ 규격으로 받기</h3>
                <p>배경 제거와 용량 최적화가 끝난 파일을 내려받아 바로 제안하세요.</p>
                <div className="mini-file"><img src="/assets/clipy-ogq-sticker-sample.gif" alt="" /><span><b>sticker_01.gif</b><small>740 × 640 · 21프레임</small></span><Icon name="check" size={17} /></div>
              </article>
            </div>
          </div>
        </section>

        <section className="features-section section-pad" id="features">
          <div className="container">
            <div className="section-heading centered reveal">
              <span className="section-label">BUILT FOR CREATORS</span>
              <h2>재미는 살리고,<br /><em>귀찮은 작업은 자동으로.</em></h2>
            </div>
            <div className="bento-grid">
              <article className="bento bento-motion reveal">
                <div className="bento-copy"><span className="bento-tag">MOTION</span><h3>움직임의 맛을<br />놓치지 않아요</h3><p>최대 3초 안에서 가장 분명한 동작을 골라 자연스럽게 반복되도록 다듬어요.</p></div>
                <div className="motion-demo">
                  {[stickerAssets.laugh, stickerAssets.surprised, stickerAssets.love, stickerAssets.victory].map((asset) => <div key={asset}><img src={asset} alt="" /></div>)}
                  <span><Icon name="play" size={17} /> LOOP 3.0s</span>
                </div>
              </article>
              <article className="bento bento-cutout reveal">
                <div className="bento-copy"><span className="bento-tag">CUT OUT</span><h3>배경은 깔끔하게,<br />캐릭터는 선명하게</h3></div>
                <div className="cutout-demo">
                  <div className="cut-before"><img src={stickerAssets.angry} alt="" /><span>BEFORE</span></div>
                  <div className="cut-after"><img src={stickerAssets.angry} alt="" /><span>AFTER</span></div>
                  <i><Icon name="arrow" size={19} /></i>
                </div>
              </article>
              <article className="bento bento-guide reveal">
                <div className="guide-top"><span className="bento-tag dark">OGQ GUIDE</span><span className="guide-status"><i /> ALL PASSED</span></div>
                <h3>규격은 CLIPY가<br />알아서 챙길게요</h3>
                <ul>
                  <li><span><Icon name="check" size={15} /></span><div><b>이미지 크기</b><small>740 × 640px</small></div></li>
                  <li><span><Icon name="check" size={15} /></span><div><b>파일 용량</b><small>각 1MB 이하</small></div></li>
                  <li><span><Icon name="check" size={15} /></span><div><b>애니메이션</b><small>최대 3초 · 100프레임</small></div></li>
                </ul>
              </article>
              <article className="bento bento-both reveal">
                <div className="bento-copy"><span className="bento-tag">2 TYPES</span><h3>움직이는 것도,<br />멈춰있는 것도</h3><p>같은 클립에서 용도에 맞는 두 가지 버전을 만들 수 있어요.</p></div>
                <div className="type-cards">
                  <div><span>STATIC</span><img src={stickerAssets.love} alt="하트 포즈의 정지형 스티커 예시" /><small>PNG</small></div>
                  <div className="moving"><span>ANIMATED GIF</span><img src="/assets/clipy-ogq-sticker-sample.gif" alt="여러 프레임이 포함된 움직이는 GIF 스티커 예시" /><small><i /> GIF · 21F</small></div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="spec-section section-pad" id="specs">
          <div className="container spec-layout">
            <div className="spec-copy reveal">
              <span className="section-label">OGQ SPEC, CHECKED</span>
              <h2>완성되는 순간,<br /><em>업로드 준비 끝.</em></h2>
              <p>OGQ 크리에이터 스튜디오의 공개 제작 가이드를 기준으로 파일을 구성합니다.</p>
              <a href="https://creators.ogq.me/guides/contents/animated-sticker" target="_blank" rel="noreferrer">OGQ 공식 가이드 보기 <Icon name="arrow" size={17} /></a>
            </div>
            <div className="spec-panel reveal">
              <div className="spec-panel-head"><span>OUTPUT_SPEC.json</span><i /><i /><i /></div>
              <div className="spec-list">
                {specs.map(([name, size, count], index) => (
                  <div className="spec-row" key={name}>
                    <span>{String(index + 1).padStart(2, '0')}</span><strong>{name}</strong><em>{size}</em><b>{count}</b>
                  </div>
                ))}
              </div>
              <div className="animation-spec"><span><Icon name="motion" size={22} /></span><div><small>24 ANIMATED GIF FILES</small><strong>GIF마다 최대 3초 · 100프레임</strong></div><em>LOOP ∞</em></div>
            </div>
          </div>
        </section>

        <section className="use-section section-pad">
          <div className="container">
            <div className="section-heading centered reveal">
              <span className="section-label">MADE TO BE USED</span>
              <h2>채팅에서 바로 통하는<br /><em>리액션을 만들어요.</em></h2>
              <p>잘 쓰이는 스티커는 길게 설명하지 않아도 감정이 보여요.</p>
            </div>
            <div className="chat-stage reveal">
              <div className="chat-column left">
                <div className="chat-bubble"><span className="avatar a1">C</span><p><b>초코라떼</b>오늘 합방 진짜 레전드 ㅋㅋㅋ</p></div>
                <div className="chat-bubble"><span className="avatar a2">D</span><p><b>도토리묵</b>이 장면 스티커 각이다</p></div>
                <div className="chat-bubble muted"><span className="avatar a3">M</span><p><b>민트단</b>나 벌써 저장함</p></div>
              </div>
              <div className="chat-sticker"><span>NEW STICKER</span><img src={stickerAssets.laugh} alt="채팅에 사용된 폭소 스티커" /><div className="reaction"><b>♥</b> 128</div></div>
              <div className="chat-column right">
                <div className="chat-bubble"><span className="avatar a4">R</span><p><b>라면먹자</b>방금 표정 뭐야 ㅋㅋ</p></div>
                <div className="chat-bubble"><span className="avatar a5">P</span><p><b>피치소다</b>이거 어디서 받아요?</p></div>
                <div className="chat-bubble muted"><span className="avatar a6">G</span><p><b>게임하는곰</b>움직이는 거 미쳤다</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section section-pad" id="faq">
          <div className="container faq-layout">
            <div className="faq-copy reveal"><span className="section-label">FAQ</span><h2>궁금한 건<br /><em>여기서 확인하세요.</em></h2><p>더 궁금한 내용이 있다면 언제든 알려주세요.</p><div className="faq-mascot"><img src={stickerAssets.think} alt="생각 중인 CLIPY 캐릭터" /></div></div>
            <Faq />
          </div>
        </section>

        <section className="final-cta section-pad">
          <div className="cta-grid" />
          <div className="container final-inner reveal">
            <div className="cta-badge"><Icon name="spark" size={18} /> YOUR CLIP, YOUR STICKER</div>
            <h2>웃고 넘긴 그 장면,<br />이제 <em>스티커로 남겨보세요.</em></h2>
            <p>치지직 클립 링크 하나로 시작할 수 있어요.</p>
            <a href="#make">지금 무료로 만들기 <Icon name="arrow" size={20} /></a>
            <div className="cta-stickers"><img src={stickerAssets.cry} alt="" /><img src={stickerAssets.surprised} alt="" /><img src={stickerAssets.love} alt="" /></div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-main">
          <div><Logo /><p>치지직 클립을 네이버 OGQ 스티커로 만드는<br />크리에이터를 위한 도구입니다.</p></div>
          <div className="footer-links"><div><strong>PRODUCT</strong><a href="#how">만드는 법</a><a href="#features">기능</a><a href="#specs">OGQ 규격</a></div><div><strong>SUPPORT</strong><a href="#faq">자주 묻는 질문</a><a href="mailto:hello@clipy.tools">문의하기</a><a href="#top">이용약관</a></div></div>
        </div>
        <div className="container footer-bottom"><p>CLIPY는 네이버, 치지직, OGQ와 제휴하거나 공식 운영되는 서비스가 아닙니다.</p><span>© 2026 CLIPY. ALL RIGHTS RESERVED.</span></div>
      </footer>
    </div>
  )
}

export default App
