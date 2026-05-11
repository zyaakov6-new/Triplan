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

    return (
      <div style={{
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
            Something went wrong
          </h2>
          {msg && (
            <p style={{
              fontSize: 13,
              color: 'var(--ink-muted)',
              marginBottom: 8,
              fontFamily: 'monospace',
              background: 'var(--cream-dark)',
              padding: '6px 10px',
              borderRadius: 8,
              wordBreak: 'break-word',
            }}>
              {msg}
            </p>
          )}
          <p style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 28 }}>
            The app hit an unexpected error. Your data is safe — tap below to reload.
          </p>
          <button className="btn btn-accent" style={{ width: '100%' }} onClick={this.handleReset}>
            Reload Triplan
          </button>
        </div>
      </div>
    )
  }
}
