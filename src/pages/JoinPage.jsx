import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useLang } from '../hooks/useLang'
import Icon from '../components/Icon'

const STRINGS = {
  he: {
    joining: 'מצטרפים לטיול…',
    soon: 'זה ייקח רק רגע',
    inYouAre: 'נכנסתם! מעבירים אתכם…',
    invalid: 'קישור הזמנה לא תקין',
    invalidSub: 'ייתכן שהקישור פג או שכבר נעשה בו שימוש.',
    home: 'חזרה לדף הבית',
    timeout: 'זה לוקח יותר מדי זמן…',
    checkConn: 'בדקו את החיבור ונסו שוב.',
    retry: 'נסו שוב',
  },
  en: {
    joining: 'Joining trip…',
    soon: 'This should only take a moment',
    inYouAre: "You're in! Redirecting…",
    invalid: 'Invalid invite link',
    invalidSub: 'This link may have expired or already been used.',
    home: 'Go home',
    timeout: 'Taking too long…',
    checkConn: 'Check your connection and try again.',
    retry: 'Retry',
  }
}

export default function JoinPage() {
  const { token } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { lang } = useLang()
  const t = STRINGS[lang === 'he' ? 'he' : 'en']
  const isHe = lang === 'he'
  const [status, setStatus] = useState('joining') // joining | success | error | timeout
  const timeoutRef = useRef(null)

  const attemptJoin = () => {
    if (!user || !token) return
    setStatus('joining')
    // 10-second safety timeout
    timeoutRef.current = setTimeout(() => setStatus('timeout'), 10_000)
    supabase.rpc('join_trip_by_token', { token })
      .then(({ data, error }) => {
        clearTimeout(timeoutRef.current)
        if (error) { setStatus('error'); return }
        setStatus('success')
        setTimeout(() => navigate(`/trip/${data}`), 1200)
      })
      .catch(() => { clearTimeout(timeoutRef.current); setStatus('error') })
  }

  useEffect(() => {
    attemptJoin()
    return () => clearTimeout(timeoutRef.current)
  }, [user, token])

  return (
    <div dir={isHe ? 'rtl' : 'ltr'} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
      {status === 'joining' && <>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="map" size={28} color="var(--ink-muted)" />
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>{t.joining}</p>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{t.soon}</p>
      </>}
      {status === 'success' && <>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={28} color="var(--teal)" />
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>{t.inYouAre}</p>
      </>}
      {status === 'error' && <>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={28} color="var(--accent)" />
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>{t.invalid}</p>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', textAlign: 'center' }}>{t.invalidSub}</p>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>{t.home}</button>
      </>}
      {status === 'timeout' && <>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={28} color="var(--sand-dark)" />
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>{t.timeout}</p>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', textAlign: 'center' }}>{t.checkConn}</p>
        <button className="btn btn-accent" onClick={attemptJoin}>{t.retry}</button>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>{t.home}</button>
      </>}
    </div>
  )
}
