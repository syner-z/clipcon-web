import Icon from './Icon.jsx'
import { stickerAssets } from '../data.js'

export default function HeroVisual({ mode }) {
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
    </div>
  )
}
