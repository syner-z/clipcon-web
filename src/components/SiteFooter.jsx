import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

// 랜딩 밖(법적 문서 페이지)에서도 같은 푸터를 쓰므로 섹션 앵커는 `/#how`처럼
// 랜딩 절대 경로로 둔다. SiteHeader의 variant="create"가 쓰는 방식과 같다.
export default function SiteFooter() {
  return (
    <footer>
      <div className="container footer-main">
        <div><Logo /><p>치지직 클립을 네이버 OGQ 스티커로 만드는<br />크리에이터를 위한 도구입니다.</p></div>
        <div className="footer-links">
          <div><strong>PRODUCT</strong><a href="/#how">만드는 법</a><a href="/#features">기능</a><a href="/#specs">OGQ 규격</a></div>
          <div><strong>SUPPORT</strong><a href="/#faq">자주 묻는 질문</a><a href="mailto:clipcon@obtuse.kr">문의하기</a><Link to="/terms">이용약관</Link><Link to="/privacy">개인정보처리방침</Link></div>
        </div>
      </div>
      <div className="container footer-bottom"><p>CLIPCON은 네이버, 치지직, OGQ와 제휴하거나 공식 운영되는 서비스가 아닙니다.</p><span>© 2026 CLIPCON. ALL RIGHTS RESERVED.</span></div>
    </footer>
  )
}
