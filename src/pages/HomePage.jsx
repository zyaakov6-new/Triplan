import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useLang } from '../hooks/useLang'
import NewTripModal from '../components/NewTripModal'
import EditTripModal from '../components/EditTripModal'
import OnboardingTour from '../components/OnboardingTour'
import Icon from '../components/Icon'
import { createExampleTrip, getExampleTripId } from '../lib/exampleTrip'

// ── i18n ──────────────────────────────────────────────────────────────────────

const T = {
  he: {
    dir:             'rtl',
    greet:           (name) => `היי${name ? ' ' + name : ''}`,
    themeLabel:      (mode) => `ערכת נושא: ${mode === 'dark' ? 'כהה' : mode === 'light' ? 'בהירה' : 'מערכת'}`,
    settingsLabel:   'הגדרות',
    joinPlaceholder: 'הדביקו קוד הזמנה כדי להצטרף לטיול…',
    joinBtn:         'הצטרפות',
    joinLoading:     '…',
    joinInvalid:     'קוד הזמנה לא תקין',
    loadFail:        'לא הצלחנו לטעון את הטיולים',
    loadFailSub:     'בדקו את החיבור לאינטרנט ונסו שוב',
    retry:           'נסו שוב',
    noTrips:         'אין טיולים עדיין',
    noTripsSub:      'התחילו לתכנן את ההרפתקה הבאה',
    newTrip:         'טיול חדש',
    noDates:         'ללא תאריכים',
    settingsTitle:   'הגדרות',
    loggedInAs:      'מחוברים כ',
    replayTour:      'הצגת סיור היכרות + טיול לדוגמה',
    creatingSample:  'יוצר טיול לדוגמה…',
    signOut:         'התנתקות',
    deleteAccount:   'מחיקת חשבון',
    deleteConfirm:   'הקישו שוב לאישור מחיקת החשבון',
    deleting:        'מוחק…',
    privacy:         'מדיניות פרטיות',
    terms:           'תנאי שימוש',
  },
  en: {
    dir:             'ltr',
    greet:           (name) => `Hey${name ? ', ' + name : ''}`,
    themeLabel:      (mode) => `Theme: ${mode}`,
    settingsLabel:   'Settings',
    joinPlaceholder: 'Paste an invite code to join a trip…',
    joinBtn:         'Join',
    joinLoading:     '…',
    joinInvalid:     'Invalid invite code',
    loadFail:        "Couldn't load your trips",
    loadFailSub:     'Check your internet connection and try again',
    retry:           'Try again',
    noTrips:         'No trips yet',
    noTripsSub:      'Start planning your next adventure',
    newTrip:         'New trip',
    noDates:         'No dates set',
    settingsTitle:   'Settings',
    loggedInAs:      'Signed in as',
    replayTour:      'Show tour + sample trip',
    creatingSample:  'Creating sample trip…',
    signOut:         'Sign out',
    deleteAccount:   'Delete account',
    deleteConfirm:   'Tap again to confirm account deletion',
    deleting:        'Deleting…',
    privacy:         'Privacy Policy',
    terms:           'Terms',
  },
}

function applyThemeMode(mode) {
  if (mode === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else if (mode === 'light') {
    document.documentElement.setAttribute('data-theme', '')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : '')
  }
}

function useThemeMode() {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light')

  useEffect(() => {
    applyThemeMode(mode)
    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyThemeMode('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [mode])

  const cycle = () => {
    const next = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light'
    setMode(next)
    localStorage.setItem('themeMode', next)
    applyThemeMode(next)
  }

  return { mode, cycle }
}

export default function HomePage() {
  const { user, profile, signOut, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const { mode, cycle: cycleTheme } = useThemeMode()

  const { lang, toggleLang } = useLang()
  const t    = T[lang]
  const isHe = lang === 'he'

  const [trips, setTrips]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [fetchError, setFetchError]     = useState(false)
  const [showNew, setShowNew]           = useState(false)
  const [editingTrip, setEditingTrip]   = useState(null)
  const [joinToken, setJoinToken]       = useState('')
  const [joining, setJoining]           = useState(false)
  const [joinError, setJoinError]       = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [confirmDelete, setConfirmDelete]     = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [creatingExample, setCreatingExample] = useState(false)

  useEffect(() => { fetchTrips() }, [user])

  const fetchTrips = async () => {
    setLoading(true)
    setFetchError(false)
    const { data, error } = await supabase
      .from('trips')
      .select('*, trip_members!inner(user_id)')
      .eq('trip_members.user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) { setFetchError(true); setLoading(false); return }
    setTrips(data || [])
    setLoading(false)

    // First-run: if this user hasn't been onboarded yet, kick off the tour.
    //
    // The onboarded flag is keyed by user ID (`triplan_onboarded_<uid>`)
    // because localStorage is shared across accounts in the same browser —
    // an earlier "I've onboarded" flag from User A must not block User B.
    //
    // If the user has zero trips we also seed the sample trek.  If the seed
    // call fails (RLS, missing column, network) we DO NOT set the onboarded
    // flag — that way the next page-load retries, and a transient failure
    // doesn't permanently disable the tour.  The flag is set by OnboardingTour
    // only when the user reaches the keep/delete step or hits Skip.
    const onboardKey = `triplan_onboarded_${user.id}`
    const onboarded = (() => { try { return localStorage.getItem(onboardKey) === '1' } catch { return false } })()
    console.log('[onboarding] check', { onboardKey, onboarded, tripCount: (data || []).length, creatingExample })

    if (!onboarded && !creatingExample) {
      if ((data || []).length === 0) {
        setCreatingExample(true)
        console.log('[onboarding] seeding sample trip for user', user.id)
        const trip = await createExampleTrip(user.id, lang)
        setCreatingExample(false)
        if (trip) {
          console.log('[onboarding] sample trip created', trip.id)
          setTrips([trip])
          setShowOnboarding(true)
        } else {
          // Sample creation failed — log loudly but DO NOT set the onboarded
          // flag.  Surface the tour anyway so the user at least sees what the
          // app does, even without a sample to play with.
          console.warn('[onboarding] sample trip creation failed — showing tour without sample')
          setShowOnboarding(true)
        }
      } else {
        // User has trips (e.g. they were invited to one before they signed
        // up via the deep link).  Still show the tour, just without seeding.
        console.log('[onboarding] user has existing trips, showing tour without sample')
        setShowOnboarding(true)
      }
    }
  }

  const handleOnboardingClose = (kept) => {
    setShowOnboarding(false)
    // If they discarded the sample, the trip is gone from the DB. Refresh
    // the local list so the UI matches.
    if (!kept) fetchTrips()
  }

  // Manual trigger from Settings — useful for users who already onboarded
  // but want to re-watch the tour or get the sample trip back. Always seeds
  // a fresh sample (even if they already have one).
  const handleReplayTour = async () => {
    setShowSettings(false)
    setCreatingExample(true)
    const trip = await createExampleTrip(user.id, lang)
    setCreatingExample(false)
    if (trip) {
      setTrips(prev => [trip, ...prev.filter(t => t.id !== trip.id)])
      setShowOnboarding(true)
    }
  }

  const handleJoin = async () => {
    if (!joinToken.trim()) return
    setJoining(true); setJoinError('')
    const { data, error } = await supabase.rpc('join_trip_by_token', { token: joinToken.trim().toLowerCase() })
    if (error) {
      setJoinError(t.joinInvalid)
      setJoining(false)
      return
    }
    setJoining(false); setJoinToken('')
    navigate(`/trip/${data}`)
  }

  const formatDates = (trip) => {
    if (!trip.date_start) return null
    const locale = lang === 'he' ? 'he' : 'en-US'
    const s = new Date(trip.date_start).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
    const e = trip.date_end ? new Date(trip.date_end).toLocaleDateString(locale, { month: 'short', day: 'numeric' }) : null
    return e ? `${s} – ${e}` : s
  }

  const handleTripUpdated = (updated) => {
    setTrips(prev => prev.map(tr => tr.id === updated.id ? updated : tr))
    setEditingTrip(null)
  }

  const handleTripDeleted = (id) => {
    setTrips(prev => prev.filter(tr => tr.id !== id))
    setEditingTrip(null)
  }

  const handleDeleteAccount = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeletingAccount(true)
    const err = await deleteAccount()
    if (err) { setDeletingAccount(false); setConfirmDelete(false); alert('Failed to delete account: ' + err.message) }
  }

  return (
    <div dir={t.dir} style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--cream)' }}>

      {/* Header */}
      <div style={{ padding: 'calc(var(--safe-top) + 20px) 20px 0', background: 'var(--white)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <div style={{ width: 28, height: 28, background: 'var(--ink)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="globe" size={14} color="var(--cream)" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, letterSpacing: '-0.02em' }}>Triplan</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{t.greet(profile?.name)}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              title={lang === 'he' ? 'Switch to English' : 'החלף לעברית'}
              style={{ height: 36, padding: '0 12px', borderRadius: 18, background: 'var(--cream)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--ink-muted)', letterSpacing: '0.03em', fontFamily: 'var(--font-body)' }}>
              {lang === 'he' ? 'EN' : 'עב'}
            </button>
            <button onClick={cycleTheme} title={t.themeLabel(mode)}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--border)' }}>
              <Icon name={mode === 'dark' ? 'sun' : mode === 'system' ? 'monitor' : 'moon'} size={16} color="var(--ink-muted)" />
            </button>
            <button onClick={() => setShowSettings(true)} aria-label={t.settingsLabel}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--border)' }}>
              <Icon name="settings" size={16} color="var(--ink-muted)" />
            </button>
          </div>
        </div>

        {/* Join input */}
        <div style={{ display: 'flex', gap: 8, paddingBottom: 16 }}>
          <input
            className="input"
            style={{ flex: 1, fontSize: 14, padding: '10px 14px', textAlign: isHe ? 'right' : 'left' }}
            placeholder={t.joinPlaceholder}
            value={joinToken}
            onChange={e => setJoinToken(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
          <button className="btn btn-ghost btn-sm" onClick={handleJoin} disabled={joining || !joinToken.trim()}>
            {joining ? t.joinLoading : t.joinBtn}
          </button>
        </div>
        {joinError && <p style={{ fontSize: 12, color: '#C00', marginBottom: 10, marginTop: -8, textAlign: isHe ? 'right' : 'left' }}>{joinError}</p>}
      </div>

      {/* Trip list */}
      <div className="scroll-y" style={{ flex: 1, padding: '20px 20px 100px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 80, borderRadius: 0 }} />
                <div style={{ padding: '12px 16px', display: 'flex', gap: 12 }}>
                  <div className="skeleton-circle" style={{ width: 44, height: 44, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                    <div className="skeleton-text" style={{ width: '60%' }} />
                    <div className="skeleton-text" style={{ width: '40%', height: 11 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ marginBottom: 16 }}><Icon name="close" size={44} color="var(--sand-dark)" /></div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>{t.loadFail}</p>
            <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 24 }}>{t.loadFailSub}</p>
            <button className="btn btn-accent" onClick={fetchTrips}>{t.retry}</button>
          </div>
        ) : trips.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ marginBottom: 16 }}><Icon name="map" size={52} color="var(--sand-dark)" /></div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>{t.noTrips}</p>
            <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginBottom: 28 }}>{t.noTripsSub}</p>
            <button className="btn btn-accent" onClick={() => setShowNew(true)}>
              <Icon name="plus" size={16} color="white" /> {t.newTrip}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trips.map(trip => (
              <TripCard key={trip.id} trip={trip} formatDates={formatDates} noDates={t.noDates} isHe={isHe}
                onClick={() => navigate(`/trip/${trip.id}`)}
                onEdit={e => { e.stopPropagation(); setEditingTrip(trip) }}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => setShowNew(true)}
        style={{ position: 'fixed', bottom: 'calc(var(--safe-bottom) + 28px)', [isHe ? 'left' : 'right']: 24, width: 56, height: 56, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(26,22,18,0.3)', zIndex: 100, cursor: 'pointer', transition: 'transform 0.15s', border: 'none' }}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.9)'}
        onTouchEnd={e => e.currentTarget.style.transform = ''}>
        <Icon name="plus" size={22} color="var(--cream)" />
      </button>

      {showNew && (
        <NewTripModal onClose={() => setShowNew(false)} onCreated={(trip) => { setShowNew(false); fetchTrips(); navigate(`/trip/${trip.id}`) }} />
      )}
      {editingTrip && (
        <EditTripModal trip={editingTrip} onClose={() => setEditingTrip(null)} onUpdated={handleTripUpdated} onDeleted={handleTripDeleted} />
      )}

      {showOnboarding && (
        <OnboardingTour
          userId={user.id}
          hasExample={!!getExampleTripId(user.id)}
          onClose={handleOnboardingClose}
        />
      )}

      {/* Settings sheet */}
      {showSettings && (
        <>
          <div className="overlay" onClick={() => { setShowSettings(false); setConfirmDelete(false) }} />
          <div className="bottom-sheet" style={{ maxHeight: '60vh' }}>
            <div className="sheet-handle" />
            <div dir={t.dir} style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, marginBottom: 4 }}>
                {t.settingsTitle}
              </h2>

              <div style={{ padding: '14px 16px', background: 'var(--cream)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 2 }}>{t.loggedInAs}</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{profile?.name || user?.email}</p>
                <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{user?.email}</p>
              </div>

              <button onClick={handleReplayTour} disabled={creatingExample}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--white)', cursor: creatingExample ? 'wait' : 'pointer', fontSize: 14, color: 'var(--ink)', opacity: creatingExample ? 0.6 : 1 }}>
                <Icon name="info" size={18} color="var(--ink-muted)" />
                {creatingExample ? t.creatingSample : t.replayTour}
              </button>

              <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--white)', cursor: 'pointer', fontSize: 14, color: 'var(--ink)' }}>
                <Icon name="logout" size={18} color="var(--ink-muted)" />
                {t.signOut}
              </button>

              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 12, border: `1px solid ${confirmDelete ? 'var(--danger-border, #fca5a5)' : 'var(--border)'}`, background: confirmDelete ? 'var(--danger-bg, #fee2e2)' : 'var(--white)', cursor: deletingAccount ? 'wait' : 'pointer', fontSize: 14, color: confirmDelete ? 'var(--danger, #b91c1c)' : 'var(--ink-muted)', opacity: deletingAccount ? 0.6 : 1 }}>
                <Icon name="trash" size={18} color={confirmDelete ? '#b91c1c' : 'var(--ink-muted)'} />
                {deletingAccount ? t.deleting : confirmDelete ? t.deleteConfirm : t.deleteAccount}
              </button>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 4 }}>
                <a href="/privacy" target="_blank" style={{ fontSize: 11, color: 'var(--ink-muted)', textDecoration: 'underline' }}>{t.privacy}</a>
                <span style={{ fontSize: 11, color: 'var(--border-strong)' }}>·</span>
                <a href="/terms" target="_blank" style={{ fontSize: 11, color: 'var(--ink-muted)', textDecoration: 'underline' }}>{t.terms}</a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function TripCard({ trip, formatDates, noDates, isHe, onClick, onEdit }) {
  return (
    <button onClick={onClick} className="card"
      style={{ width: '100%', cursor: 'pointer', overflow: 'hidden', transition: 'transform 0.15s' }}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.985)'}
      onTouchEnd={e => e.currentTarget.style.transform = ''}>
      {trip.cover_photo_url ? (
        <div style={{ position: 'relative', height: 110, overflow: 'hidden' }}>
          <img src={trip.cover_photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(26,22,18,0.65))' }} />
          <div style={{ position: 'absolute', bottom: 10, [isHe ? 'left' : 'right']: 14, [isHe ? 'right' : 'left']: 50 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, color: '#fff', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.name}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)' }}>{[trip.destination, formatDates(trip)].filter(Boolean).join(' · ') || noDates}</p>
          </div>
          <button onClick={onEdit} style={{ position: 'absolute', top: 8, [isHe ? 'right' : 'left']: 8, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.3)' }}>
            <Icon name="edit" size={13} color="white" />
          </button>
        </div>
      ) : (
        <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="map" size={24} color="var(--accent)" />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, color: 'var(--ink)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.name}</p>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>{[trip.destination, formatDates(trip)].filter(Boolean).join(' · ') || noDates}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={onEdit} style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="edit" size={13} color="var(--ink-muted)" />
            </button>
            {/* chevron points toward the detail screen: left in LTR, right in RTL */}
            <Icon name={isHe ? 'chevron_left' : 'chevron_right'} size={18} color="var(--sand-dark)" />
          </div>
        </div>
      )}
    </button>
  )
}
