import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import Logo from '../components/Logo.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import ClipUrlForm from '../components/ClipUrlForm.jsx'
import HeroVisual from '../components/HeroVisual.jsx'
import Faq from '../components/Faq.jsx'
import { filmAssets, specs, stickerAssets } from '../data.js'

export default function LandingPage() {
  const [mode, setMode] = useState('static')
  const [url, setUrl] = useState('')
  const navigate = useNavigate()

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

  const goToCreate = (validatedUrl) => {
    navigate(`/create?url=${encodeURIComponent(validatedUrl)}&mode=${mode}`)
  }

  return (
    <div className="site-shell" id="top">
      <SiteHeader />

      <main>
        <section className="hero section-pad">
          <div className="hero-glow glow-left" /><div className="hero-glow glow-right" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="hero-kicker">치지직 클립, 이제 스티커로 소장하세요</div>
              <h1>그 순간을,<br /><span>움직이는 스티커로.</span></h1>
              <div className="hero-points">
                <span><Icon name="check" size={15} /> AI 하이라이트 포착</span>
                <span><Icon name="check" size={15} /> 투명 배경 자동 처리</span>
                <span><Icon name="check" size={15} /> OGQ 규격 자동 적용</span>
              </div>
              <div className="generator-card" id="make">
                <div className="generator-topline">
                  <span className="window-dots"><i /><i /><i /></span>
                  <span className="secure-note"><Icon name="shield" size={15} /> 처리 후 바로 삭제해요</span>
                </div>
                <ClipUrlForm url={url} onUrlChange={setUrl} mode={mode} setMode={setMode} onSubmit={goToCreate} />
              </div>
            </div>
            <HeroVisual mode={mode} />
          </div>
        </section>

        <section className="how-section section-pad" id="how">
          <div className="film-strip" aria-label="스티커 장면이 흐르는 영화 필름">
            <div className="film-belt">
              <div className="film-runner">
                {[0, 1, 2].map((group) => (
                  <div className="film-segment" key={group} aria-hidden={group !== 0}>
                    {filmAssets.map((asset, index) => (
                      <div className="film-cell" key={`${group}-${asset}`}>
                        <div className="film-sprockets" aria-hidden="true"><i /><i /></div>
                        <div className="film-frame">
                          <img src={asset} alt={group === 0 ? `CLIPY 스티커 장면 ${index + 1}` : ''} />
                        </div>
                        <div className="film-sprockets" aria-hidden="true"><i /><i /></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="container">
            <div className="section-heading reveal">
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
                <div className="guide-top"><span className="bento-tag dark">OGQ GUIDE</span></div>
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
              <h2>완성되는 순간,<br /><em>업로드 준비 끝.</em></h2>
              <p>OGQ 크리에이터 스튜디오의 공개 제작 가이드를 기준으로 파일을 구성합니다.</p>
              <a href="https://creators.ogq.me/guides/contents/animated-sticker" target="_blank" rel="noreferrer">OGQ 공식 가이드 보기 <Icon name="arrow" size={17} /></a>
            </div>
            <div className="spec-panel reveal">
              <div className="spec-panel-head"><span>OUTPUT_SPEC.json</span><i /><i /><i /></div>
              <div className="spec-list">
                {specs.map(([name, size, count]) => (
                  <div className="spec-row" key={name}>
                    <strong>{name}</strong><em>{size}</em><b>{count}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="use-section section-pad">
          <div className="container">
            <div className="section-heading centered reveal">
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
            <div className="faq-copy reveal"><h2>궁금한 건<br /><em>여기서 확인하세요.</em></h2><p>더 궁금한 내용이 있다면 언제든 알려주세요.</p><div className="faq-mascot"><img src={stickerAssets.think} alt="생각 중인 CLIPY 캐릭터" /></div></div>
            <Faq />
          </div>
        </section>

        <section className="final-cta section-pad">
          <div className="cta-grid" />
          <div className="container final-inner reveal">
            <div className="cta-badge"><Icon name="spark" size={18} /> YOUR CLIP, YOUR STICKER</div>
            <h2>웃고 넘긴 그 장면,<br />이제 <em>스티커로 남겨보세요.</em></h2>
            <p>치지직 클립 링크 하나로 시작할 수 있어요.</p>
            <Link to="/create">지금 무료로 만들기 <Icon name="arrow" size={20} /></Link>
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
