import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { useEffect } from 'react'
import Icon from './components/Icon'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import TripDetailPage from './pages/TripDetailPage'
import JoinPage from './pages/JoinPage'
import ViewPage from './pages/ViewPage'
import './index.css'

// Apply saved theme on load (supports 'light', 'dark', 'system')
;(function () {
  const mode = localStorage.getItem('themeMode') || (localStorage.getItem('theme') === 'dark' ? 'dark' : 'light')
  if (mode === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else if (mode === 'system') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.setAttribute('data-theme', 'dark')
  }
})()

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 12 }}><Icon name="map" size={36} color="var(--sand-dark)" /></div>
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
      <Route path="/view/:token" element={<ViewPage />} />
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
