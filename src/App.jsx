import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import TripDetailPage from './pages/TripDetailPage'
import JoinPage from './pages/JoinPage'
import './index.css'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>✈️</div>
        <p style={{ color: 'var(--ink-muted)', fontSize: 14, fontFamily: 'var(--font-body)' }}>Loading…</p>
      </div>
    </div>
  )

  if (!user) return (
    <Routes>
      <Route path="/join/:token" element={<AuthPage />} />
      <Route path="*" element={<AuthPage />} />
    </Routes>
  )

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/trip/:id" element={<TripDetailPage />} />
      <Route path="/join/:token" element={<JoinPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
