import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { inject } from '@vercel/analytics'
import { initSentry } from './lib/sentry'

inject()
initSentry()  // no-op if VITE_SENTRY_DSN is not set

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
