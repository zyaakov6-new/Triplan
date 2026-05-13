/**
 * Small banner that appears in the bottom-right when a new service worker
 * has finished installing.  The user taps "Reload" to swap to the new bundle.
 *
 * This is the missing piece without which `registerType: 'prompt'` would
 * silently leave users on the old bundle forever.
 */
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useLang } from '../hooks/useLang'
import Icon from './Icon'

const STRINGS = {
  he: { msg: 'גרסה חדשה זמינה', btn: 'רענון', dismiss: 'התעלם' },
  en: { msg: 'New version available', btn: 'Reload', dismiss: 'Dismiss' },
}

export default function PWAUpdatePrompt() {
  const { lang } = useLang()
  const t = STRINGS[lang === 'he' ? 'he' : 'en']
  const isHe = lang === 'he'

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(err) { console.warn('[pwa] register error', err) },
  })

  if (!needRefresh) return null

  return (
    <div
      dir={isHe ? 'rtl' : 'ltr'}
      role="status"
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        insetInlineEnd: 16,
        zIndex: 9999,
        maxWidth: 'calc(100vw - 32px)',
        background: '#1A1612',
        color: '#F5F0E8',
        borderRadius: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        animation: 'slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      <Icon name="refresh" size={16} color="#C4622D" />
      <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{t.msg}</span>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          background: '#C4622D',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '6px 12px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {t.btn}
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        aria-label={t.dismiss}
        title={t.dismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(245,240,232,0.5)',
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Icon name="close" size={14} color="rgba(245,240,232,0.5)" />
      </button>
    </div>
  )
}
