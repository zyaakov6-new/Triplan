import { Component } from 'react'
import Icon from './Icon'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[Triplan] Uncaught error:', error, info?.componentStack)
    // If Sentry is loaded it captures automatically via the withErrorBoundary wrapper
    if (typeof window.__sentryCapture === 'function') {
      window.__sentryCapture(error, { extra: info })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const msg = this.state.error?.message

    // ErrorBoundary is a class component - useLang can't be called here, so we
    // read the lang preference directly from localStorage (same source useLang
    // uses).  Falls back to English if the read fails.
    let isHe = false
    try {
      isHe = (localStorage.getItem('triplan_lang') || (navigator.language?.startsWith('he') ? 'he' : 'en')) === 'he'
    } catch { /* SSR / private mode - keep English */ }

    const t = isHe ? {
      title:  'משהו השתבש',
      body:   'האפליקציה נתקלה בשגיאה לא צפויה. הנתונים שלכם מאובטחים. הקישו למטה לטעינה מחדש.',
      reload: 'טעינה מחדש של Triplan',
    } : {
      title:  'Something went wrong',
      body:   'The app hit an unexpected error. Your data is safe. Tap below to reload.',
      reload: 'Reload Triplan',
    }

    return (
      <div dir={isHe ? 'rtl' : 'ltr'} style={{
        height: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        background: 'var(--cream)',
        fontFamily: 'var(--font-body)',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 340 }}>
          <div style={{ marginBottom: 16 }}>
            <Icon name="alert" size={48} color="var(--sand-dark)" />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 400,
            marginBottom: 8,
            color: 'var(--ink)',
          }}>
            {t.title}
          </h2>
          {import.meta.env.DEV && msg && (
            <p style={{
              fontSize: 13,
              color: 'var(--ink-muted)',
              marginBottom: 8,
              fontFamily: 'monospace',
              background: 'var(--cream-dark)',
              padding: '6px 10px',
              borderRadius: 8,
              wordBreak: 'break-word',
              direction: 'ltr',
              textAlign: 'left',
            }}>
              {msg}
            </p>
          )}
          <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 28 }}>
            {t.body}
          </p>
          <button className="btn btn-accent" style={{ width: '100%' }} onClick={this.handleReset}>
            {t.reload}
          </button>
        </div>
      </div>
    )
  }
}
