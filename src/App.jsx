import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Icon from './components/Icon'
import ErrorBoundary from './components/ErrorBoundary'
import PWAUpdatePrompt from './components/PWAUpdatePrompt'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import TripDetailPage from './pages/TripDetailPage'
import JoinPage from './pages/JoinPage'
import ViewPage from './pages/ViewPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import './index.css'

// Apply saved theme on load
;(function () {
  const mode = localStorage.getItem('themeMode') || 'light'
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
      {/* Public marketing + auth */}
      <Route path="/"               element={<LandingPage />} />
      <Route path="/auth"           element={<AuthPage />} />
      <Route path="/login"          element={<Navigate to="/auth" replace />} />
      {/* Deep-link: show auth so user can sign in then get joined */}
      <Route path="/join/:token"    element={<AuthPage />} />
      {/* Utility pages always accessible */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/privacy"        element={<PrivacyPage />} />
      <Route path="/terms"          element={<TermsPage />} />
      {/* Everything else → landing */}
      <Route path="*"               element={<Navigate to="/" replace />} />
    </Routes>
  )

  return (
    <Routes>
      <Route path="/"               element={<HomePage />} />
      <Route path="/trip/:id"       element={<TripDetailPage />} />
      <Route path="/join/:token"    element={<JoinPage />} />
      <Route path="/view/:token"    element={<ViewPage />} />
      {/* Logged-in users visiting auth → send home */}
      <Route path="/auth"           element={<Navigate to="/" replace />} />
      <Route path="/login"          element={<Navigate to="/" replace />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/privacy"        element={<PrivacyPage />} />
      <Route path="/terms"          element={<TermsPage />} />
      <Route path="*"               element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <PWAUpdatePrompt />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
