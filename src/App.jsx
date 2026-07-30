import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './routes/LandingPage.jsx'
import CreatePage from './routes/CreatePage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/create" element={<CreatePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
