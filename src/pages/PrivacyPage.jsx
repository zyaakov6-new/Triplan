import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'

export default function PrivacyPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--cream)', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 20px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 0 32px', borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
          <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--white)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <Icon name="chevron_left" size={18} color="var(--ink-muted)" />
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400 }}>Privacy Policy</h1>
            <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>Last updated: May 2026</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontSize: 15, lineHeight: 1.7, color: 'var(--ink)' }}>
          <section>
            <h2 style={h2}>1. Who we are</h2>
            <p>Triplan ("we", "our", "us") is a trip-planning application. We collect and process personal data to provide you with the service. For privacy enquiries, contact us at: <a href="mailto:privacy@triplan.app" style={link}>privacy@triplan.app</a>.</p>
          </section>

          <section>
            <h2 style={h2}>2. Data we collect</h2>
            <ul style={ul}>
              <li><strong>Account data:</strong> your name and email address, collected when you sign up or sign in with Google.</li>
              <li><strong>Trip data:</strong> itineraries, stops, notes, packing lists, and photos you create within the app.</li>
              <li><strong>Device &amp; usage data:</strong> Vercel Analytics collects anonymous page-view events (no cookies, no personal identifiers). See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={link}>Vercel's privacy policy</a>.</li>
              <li><strong>Error data:</strong> If configured, Sentry may capture anonymised crash reports. No personal trip content is sent.</li>
            </ul>
          </section>

          <section>
            <h2 style={h2}>3. How we use your data</h2>
            <ul style={ul}>
              <li>To create and maintain your account.</li>
              <li>To store and sync your trips across devices and with collaborators.</li>
              <li>To send transactional emails (password reset, invite notifications).</li>
              <li>To monitor app stability and fix bugs.</li>
            </ul>
            <p style={{ marginTop: 10 }}>We do <strong>not</strong> sell your data, use it for advertising, or share it with third parties beyond the service providers listed above.</p>
          </section>

          <section>
            <h2 style={h2}>4. Legal basis (GDPR)</h2>
            <p>We process your data on the basis of <strong>contract performance</strong> (Art. 6(1)(b) GDPR) — to deliver the service you signed up for — and <strong>legitimate interests</strong> (Art. 6(1)(f)) for error monitoring and abuse prevention.</p>
          </section>

          <section>
            <h2 style={h2}>5. Data storage &amp; security</h2>
            <p>Your data is stored on Supabase infrastructure in the EU (Frankfurt). Data is encrypted at rest and in transit. We retain your data until you delete your account.</p>
          </section>

          <section>
            <h2 style={h2}>6. Your rights</h2>
            <p>Under GDPR and Israeli Privacy Protection Law you have the right to:</p>
            <ul style={ul}>
              <li><strong>Access</strong> your personal data.</li>
              <li><strong>Rectify</strong> inaccurate data.</li>
              <li><strong>Delete</strong> your account and all associated data — available in the app under Settings → Delete account.</li>
              <li><strong>Export</strong> your data — contact us at <a href="mailto:privacy@triplan.app" style={link}>privacy@triplan.app</a>.</li>
              <li><strong>Object</strong> to processing or lodge a complaint with your local data protection authority.</li>
            </ul>
          </section>

          <section>
            <h2 style={h2}>7. Third-party services</h2>
            <ul style={ul}>
              <li><strong>Supabase</strong> — database and authentication (<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={link}>privacy policy</a>).</li>
              <li><strong>Vercel</strong> — hosting and analytics (<a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={link}>privacy policy</a>).</li>
              <li><strong>OpenFreeMap / OpenStreetMap</strong> — map tiles. No personal data is sent. Map data © OpenStreetMap contributors (ODbL).</li>
              <li><strong>Google OAuth</strong> — optional sign-in. Only your name and email are transferred.</li>
            </ul>
          </section>

          <section>
            <h2 style={h2}>8. Changes</h2>
            <p>We may update this policy. Significant changes will be communicated via the app or email.</p>
          </section>
        </div>
      </div>
    </div>
  )
}

const h2 = { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, marginBottom: 10, color: 'var(--ink)' }
const ul = { paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }
const link = { color: 'var(--accent)', textDecoration: 'underline' }
