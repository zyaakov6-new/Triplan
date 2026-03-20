import { useEffect } from 'react'
import Icon from './Icon'

export default function BottomSheet({ onClose, title, children, noPadding }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="bottom-sheet" style={{ maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        <div className="sheet-handle" />
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 0', flexShrink: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500 }}>{title}</h2>
            <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--cream)', cursor: 'pointer' }}>
              <Icon name="close" size={16} color="var(--ink-muted)" />
            </button>
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto', padding: noPadding ? 0 : '16px 20px 20px' }} className="scroll-y">
          {children}
        </div>
      </div>
    </>
  )
}
