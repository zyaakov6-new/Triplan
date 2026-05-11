/**
 * Sentry error-tracking initialisation.
 *
 * To enable, add VITE_SENTRY_DSN to your .env.local (and Vercel env vars):
 *   VITE_SENTRY_DSN=https://xxxx@oxxxx.ingest.sentry.io/xxxxx
 *
 * Get your DSN from https://sentry.io → Project Settings → Client Keys (DSN).
 */

const DSN = import.meta.env.VITE_SENTRY_DSN

let _Sentry = null

export async function initSentry() {
  if (!DSN) return   // Sentry disabled — no DSN configured

  try {
    const Sentry = await import('@sentry/react')
    Sentry.init({
      dsn: DSN,
      environment: import.meta.env.MODE,          // 'production' | 'development'
      release: import.meta.env.VITE_APP_VERSION,  // optional: set in env
      tracesSampleRate: import.meta.env.PROD ? 0.15 : 1.0,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
      ],
    })

    // Expose capture helper for ErrorBoundary's componentDidCatch
    window.__sentryCapture = (err, ctx) => Sentry.captureException(err, ctx)

    _Sentry = Sentry
    console.log('[Triplan] Sentry initialised')
  } catch (e) {
    console.warn('[Triplan] Sentry failed to load:', e)
  }
}

export function getSentry() { return _Sentry }
