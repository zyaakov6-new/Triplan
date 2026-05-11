import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'

export default function TermsPage() {
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
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400 }}>Terms of Service</h1>
            <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>Last updated: May 2026</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontSize: 15, lineHeight: 1.7, color: 'var(--ink)' }}>
          <section>
            <h2 style={h2}>1. Acceptance</h2>
            <p>By creating an account or using Triplan, you agree to these Terms of Service. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 style={h2}>2. The service</h2>
            <p>Triplan provides collaborative trip-planning tools including itineraries, maps, packing lists, and photo sharing. We reserve the right to modify, suspend, or discontinue any part of the service with reasonable notice.</p>
          </section>

          <section>
            <h2 style={h2}>3. Your account</h2>
            <ul style={ul}>
              <li>You must be 13 years or older to use Triplan.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must not share your account with others or create accounts on behalf of third parties.</li>
            </ul>
          </section>

          <section>
            <h2 style={h2}>4. Your content</h2>
            <p>You retain ownership of the trips, photos, and notes you create. By uploading content you grant Triplan a limited licence to store and display it to you and your invited collaborators. You must not upload content that:</p>
            <ul style={ul}>
              <li>Infringes the intellectual property or privacy rights of others.</li>
              <li>Is illegal, harmful, or offensive.</li>
              <li>Contains malware or attempts to compromise the service.</li>
            </ul>
          </section>

          <section>
            <h2 style={h2}>5. Collaborative features</h2>
            <p>When you share a trip invite link, anyone with that link can join your trip and view and edit its content. You are responsible for managing who you share invite links with. You can revoke access by removing a member from the trip.</p>
          </section>

          <section>
            <h2 style={h2}>6. Acceptable use</h2>
            <p>You may not use Triplan to: scrape or harvest data, reverse-engineer the service, circumvent security measures, or use the service in any way that violates applicable law.</p>
          </section>

          <section>
            <h2 style={h2}>7. Disclaimers</h2>
            <p>Triplan is provided "as is" without warranties of any kind. Map data is provided by OpenStreetMap contributors and may not be accurate or up to date. Do not rely solely on Triplan for safety-critical navigation decisions.</p>
          </section>

          <section>
            <h2 style={h2}>8. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, Triplan is not liable for any indirect, incidental, or consequential damages arising from your use of the service, including loss of data.</p>
          </section>

          <section>
            <h2 style={h2}>9. Termination</h2>
            <p>You may delete your account at any time via Settings → Delete account. We may suspend or terminate accounts that violate these terms. Upon termination, your data is permanently deleted.</p>
          </section>

          <section>
            <h2 style={h2}>10. Governing law</h2>
            <p>These terms are governed by the laws of Israel. Any disputes shall be resolved in the courts of Tel Aviv.</p>
          </section>

          <section>
            <h2 style={h2}>11. Contact</h2>
            <p>Questions? <a href="mailto:hello@triplan.app" style={link}>hello@triplan.app</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}

const h2 = { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, marginBottom: 10, color: 'var(--ink)' }
const ul = { paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }
const link = { color: 'var(--accent)', textDecoration: 'underline' }
