/**
 * First-run welcome + tour.
 *
 * Triggered from HomePage when localStorage `triplan_onboarded` is unset.
 * Walks the user through what Triplan does, then presents the sample trip
 * we just created in their account with a Keep / Delete choice.
 *
 * Done as a single fullscreen-overlay component with a step counter rather
 * than a coach-mark library because (a) one less dep, (b) the steps are
 * narrative not "click here", (c) it doubles as the marketing copy people
 * see in screenshots.
 */
import { useState } from 'react'
import { useLang } from '../hooks/useLang'
import { track } from '../lib/analytics'
import { deleteExampleTrip } from '../lib/exampleTrip'
import Icon from './Icon'

const STRINGS = {
  he: {
    skip: 'דילוג',
    next: 'הבא',
    back: 'חזרה',
    start: 'נתחיל',
    keep:    'שמרו את הדוגמה',
    discard: 'מחקו והתחילו מאפס',
    deleting: 'מוחק…',
    steps: [
      {
        title:  'ברוכים הבאים ל-Triplan',
        body:   'מתכננים טיול של כמה ימים? אנחנו פה כדי לעזור לקבוצה שלכם להיות באותו ראש.',
      },
      {
        title:  'יום, עצירות, מפה',
        body:   'מחלקים את הטיול לימים. כל יום מקבל רשימת עצירות על המפה: תצפיות, מים, לינה, תחבורה.',
      },
      {
        title:  'הקבוצה רואה הכל בזמן אמת',
        body:   'משתפים קישור עריכה עם החברים, וכולם רואים שינויים מיד. אפשר גם לשתף קישור לצפייה בלבד עם ההורים, בלי להירשם.',
      },
      {
        title:  'רשימת ציוד, תמונות, יומן',
        body:   'בכל טיול יש רשימת ציוד משותפת, אלבום תמונות לכל יום, ויומן להערות. הכל עובד גם בלי אינטרנט.',
      },
      {
        title:  'הכנו לכם טיול לדוגמה',
        body:   'יצרנו בחשבון שלכם טרק ים-אל-ים של 3 ימים. שחקו איתו, הוסיפו או מחקו עצירות, נסו את המפה. כשמתחילים את הטיול האמיתי שלכם, אפשר למחוק את הדוגמה.',
        choices: true,
      },
    ],
  },
  en: {
    skip: 'Skip',
    next: 'Next',
    back: 'Back',
    start: 'Let’s go',
    keep:    'Keep the sample',
    discard: 'Delete it, start fresh',
    deleting: 'Deleting…',
    steps: [
      {
        title:  'Welcome to Triplan',
        body:   'Planning a multi-day trip with friends? We help your group stay on the same page.',
      },
      {
        title:  'Days, stops, map',
        body:   'Break a trip into days. Each day gets a list of stops on the map: viewpoints, water, lodging, transport.',
      },
      {
        title:  'The group sees everything live',
        body:   'Share an edit link with friends and they see your changes instantly. Share a read-only link with parents and they don’t need to sign up.',
      },
      {
        title:  'Packing list, photos, journal',
        body:   'Every trip has a shared packing list, a photo album per day, and a journal. Everything works offline.',
      },
      {
        title:  'We made you a sample trip',
        body:   'There’s now a 3-day Yam-le-Yam trek in your account. Play with it: add stops, try the map, share the view link. When you’re ready for your real trip, you can delete this one.',
        choices: true,
      },
    ],
  }
}

export default function OnboardingTour({ userId, hasExample = true, onClose }) {
  const { lang } = useLang()
  const t = STRINGS[lang === 'he' ? 'he' : 'en']
  const isHe = lang === 'he'
  const [step, setStep] = useState(0)
  const [deleting, setDeleting] = useState(false)

  // Onboarded flag is per-user so a new account in the same browser still
  // gets the tour even if a previous account already completed it.
  const onboardKey = `triplan_onboarded_${userId}`

  const current = t.steps[step]
  const isLast = step === t.steps.length - 1

  const finish = (kept) => {
    try { localStorage.setItem(onboardKey, '1') } catch {}
    track(kept ? 'example_kept' : 'example_deleted')
    track('onboarding_complete', { step_reached: step + 1, total: t.steps.length })
    onClose(kept)
  }

  const handleKeep = () => finish(true)

  const handleDiscard = async () => {
    setDeleting(true)
    try { await deleteExampleTrip(userId) } catch (e) { console.warn(e) }
    setDeleting(false)
    finish(false)
  }

  const handleSkip = () => {
    try { localStorage.setItem(onboardKey, '1') } catch {}
    track('onboarding_complete', { step_reached: step + 1, total: t.steps.length, skipped: true })
    onClose(true) // keep the sample by default on skip - they can delete later
  }

  return (
    <div
      dir={isHe ? 'rtl' : 'ltr'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'rgba(26,22,18,0.92)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn 0.25s ease',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Skip in the corner - explicit "I get it, let me out" */}
      {!isLast && (
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 0px) + 14px)',
            insetInlineEnd: 16,
            background: 'transparent',
            border: 'none',
            color: 'rgba(245,240,232,0.55)',
            fontSize: 13,
            cursor: 'pointer',
            padding: 8,
            fontFamily: 'inherit',
          }}
        >
          {t.skip}
        </button>
      )}

      {/* Step indicator dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
        {t.steps.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 7,
            height: 7,
            borderRadius: 4,
            background: i <= step ? '#C4622D' : 'rgba(245,240,232,0.22)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {/* Card */}
      <div
        key={step}
        className="anim-up"
        style={{
          maxWidth: 420,
          width: '100%',
          background: '#F5F0E8',
          borderRadius: 20,
          padding: '28px 24px 24px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* Step icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 16, background: '#1A1612',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 18px',
        }}>
          <Icon name={['globe', 'map', 'users', 'package', 'check'][step]} size={28} color="#C4622D" />
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 500,
          color: '#1A1612',
          marginBottom: 12,
          lineHeight: 1.2,
          letterSpacing: '-0.5px',
        }}>
          {current.title}
        </h2>
        <p style={{
          fontSize: 15,
          color: '#4A3F35',
          lineHeight: 1.55,
          marginBottom: 28,
        }}>
          {current.body}
        </p>

        {/* Action row */}
        {current.choices ? (
          hasExample ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                className="btn btn-accent"
                style={{ width: '100%' }}
                onClick={handleKeep}
                disabled={deleting}
              >
                {t.keep}
              </button>
              <button
                className="btn btn-ghost"
                style={{ width: '100%' }}
                onClick={handleDiscard}
                disabled={deleting}
              >
                {deleting ? t.deleting : t.discard}
              </button>
            </div>
          ) : (
            // No sample trip was created (existing user, or seed failed).
            // Just give them a single Done button.
            <button className="btn btn-accent" style={{ width: '100%' }} onClick={() => finish(true)}>
              {t.start}
            </button>
          )
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}>
                {t.back}
              </button>
            )}
            <button className="btn btn-accent" style={{ flex: step > 0 ? 2 : 1 }} onClick={() => setStep(s => s + 1)}>
              {step === t.steps.length - 2 ? t.start : t.next}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
