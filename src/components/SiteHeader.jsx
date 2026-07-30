import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import Logo from './Logo.jsx'

export default function SiteHeader({ variant = 'landing' }) {
  const isLanding = variant === 'landing'

  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        {isLanding ? (
          <>
            <nav aria-label="주요 메뉴">
              <a href="#how">만드는 법</a>
              <a href="#features">기능</a>
              <a href="#specs">OGQ 규격</a>
              <a href="#faq">FAQ</a>
            </nav>
            <Link className="header-cta" to="/create">무료로 만들기 <Icon name="arrow" size={17} /></Link>
          </>
        ) : (
          <nav aria-label="주요 메뉴" className="header-nav-end">
            <a href="/#how">만드는 법</a>
            <a href="/#faq">FAQ</a>
          </nav>
        )}
      </div>
    </header>
  )
}
