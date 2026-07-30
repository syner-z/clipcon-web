import { Link } from 'react-router-dom'
import { loginUrl } from '../api.js'
import { useAuth } from '../auth.jsx'
import Icon from './Icon.jsx'
import Logo from './Logo.jsx'

export default function SiteHeader({ variant = 'landing' }) {
  const isLanding = variant === 'landing'
  const { user, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  const authControl = loading ? (
    <span className="header-auth-loading" aria-label="로그인 상태 확인 중" />
  ) : user ? (
    <div className="header-user">
      {user.picture ? <img src={user.picture} alt="" referrerPolicy="no-referrer" /> : <span>{user.name?.slice(0, 1) || 'C'}</span>}
      <div>
        <strong>{user.name || user.email}</strong>
        <small>남은 생성 {user.quotaRemaining}회</small>
      </div>
      <button type="button" onClick={handleSignOut}>로그아웃</button>
    </div>
  ) : (
    <a className="header-login" href={loginUrl(`${window.location.pathname}${window.location.search}`)}>Google로 로그인</a>
  )

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
            <div className="header-actions">
              {authControl}
              <Link className="header-cta" to="/create">무료로 만들기 <Icon name="arrow" size={17} /></Link>
            </div>
          </>
        ) : (
          <>
            <nav aria-label="주요 메뉴" className="header-nav-end">
              <a href="/#how">만드는 법</a>
              <a href="/#faq">FAQ</a>
            </nav>
            <div className="header-actions">{authControl}</div>
          </>
        )}
      </div>
    </header>
  )
}
