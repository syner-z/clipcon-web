import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LandingPage from './routes/LandingPage.jsx'
import CreatePage from './routes/CreatePage.jsx'
import LegalPage from './routes/LegalPage.jsx'
import { terms } from './legal/terms.js'
import { privacy } from './legal/privacy.js'
import { trackPageView } from './analytics.js'

const ROUTE_TITLES = {
  '/': 'CLIPCON — 치지직 클립을 OGQ 스티커로',
  '/create': '스티커 만들기 — CLIPCON',
  '/terms': '이용약관 — CLIPCON',
  '/privacy': '개인정보처리방침 — CLIPCON',
}

function RouteAnalytics() {
  const { pathname } = useLocation()

  useEffect(() => {
    const title = ROUTE_TITLES[pathname] ?? ROUTE_TITLES['/']
    document.title = title
    trackPageView(pathname, title)
    // pathname만 지켜본다. location 객체 전체를 넣으면 CreatePage가 authError
    // 쿼리를 지울 때(setSearchParams) 페이지뷰가 한 번 더 나간다.
  }, [pathname])

  return null
}

export default function App() {
  return (
    <>
      <RouteAnalytics />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/terms" element={<LegalPage doc={terms} />} />
        <Route path="/privacy" element={<LegalPage doc={privacy} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
