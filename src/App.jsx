import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './routes/LandingPage.jsx'
import CreatePage from './routes/CreatePage.jsx'
import LegalPage from './routes/LegalPage.jsx'
import { terms } from './legal/terms.js'
import { privacy } from './legal/privacy.js'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/create" element={<CreatePage />} />
      <Route path="/terms" element={<LegalPage doc={terms} />} />
      <Route path="/privacy" element={<LegalPage doc={privacy} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
