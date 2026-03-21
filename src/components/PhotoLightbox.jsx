import { useState, useRef, useEffect } from 'react'
import Icon from './Icon'

export default function PhotoLightbox({ photos, initialIndex = 0, onClose }) {
  const [idx, setIdx] = useState(initialIndex)
  const touchStart = useRef(0)

  const prev = () => setIdx(i => Math.max(0, i - 1))
  const next = () => setIdx(i => Math.min(photos.length - 1, i + 1))

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.96)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}
      onClick={onClose}
    >
      {/* Close */}
      <button onClick={onClose} style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top,0px) + 16px)', right: 16, zIndex: 10, width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)' }}>
        <Icon name="close" size={20} color="white" />
      </button>

      {/* Counter */}
      <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top,0px) + 24px)', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', borderRadius: 100, padding: '4px 14px', fontSize: 13, color: 'rgba(255,255,255,0.85)', zIndex: 10, whiteSpace: 'nowrap' }}>
        {idx + 1} / {photos.length}
      </div>

      {/* Image */}
      <div
        style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px 80px' }}
        onClick={e => e.stopPropagation()}
        onTouchStart={e => { touchStart.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          const dx = e.changedTouches[0].clientX - touchStart.current
          if (dx < -50) next()
          else if (dx > 50) prev()
        }}
      >
        <img
          src={photos[idx]}
          alt=""
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 10, boxShadow: '0 8px 60px rgba(0,0,0,0.7)', animation: 'scaleIn 0.18s ease' }}
        />
      </div>

      {/* Prev */}
      {idx > 0 && (
        <button onClick={e => { e.stopPropagation(); prev() }}
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', zIndex: 10 }}>
          <Icon name="chevron_left" size={24} color="white" />
        </button>
      )}

      {/* Next */}
      {idx < photos.length - 1 && (
        <button onClick={e => { e.stopPropagation(); next() }}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', zIndex: 10 }}>
          <Icon name="chevron_right" size={24} color="white" />
        </button>
      )}

      {/* Dots */}
      {photos.length > 1 && (
        <div style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom,0px) + 28px)', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 7, zIndex: 10 }}>
          {photos.map((_, i) => (
            <div key={i}
              onClick={e => { e.stopPropagation(); setIdx(i) }}
              style={{ width: i === idx ? 22 : 7, height: 7, borderRadius: 4, background: i === idx ? 'white' : 'rgba(255,255,255,0.35)', transition: 'all 0.22s', cursor: 'pointer' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
