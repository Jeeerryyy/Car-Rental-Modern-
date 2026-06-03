import { Link } from 'react-router-dom';

export default function Cookies() {
  return (
    <main id="main-content" className="min-h-screen pt-12 pb-24" style={{ background: '#F4F1EA' }}>
      <div className="max-w-[800px] mx-auto px-6 lg:px-10">
        <nav className="text-sm mb-8 flex gap-2" aria-label="Breadcrumb">
          <Link to="/" className="no-underline" style={{ color: '#5C5C5C' }}>Home</Link>
          <span style={{ color: '#5C5C5C' }}>/</span>
          <span className="font-semibold" style={{ color: '#121212' }}>Cookies Policy</span>
        </nav>

        <h1 className="font-display text-4xl font-bold mb-6" style={{ color: '#121212' }}>Cookies Policy</h1>

        <div className="rounded-card p-8 space-y-6 text-sm leading-relaxed" style={{ background: '#F8F6F1', color: '#121212', border: '1px solid #D6D0C7' }}>
          <p>This Cookies Policy explains how Modern Selfdrive ("we", "us", or "our") uses cookies and similar tracking technologies on our website.</p>

          <h3 className="font-bold text-base" style={{ color: '#121212' }}>What Are Cookies?</h3>
          <p style={{ color: '#5C5C5C' }}>
            Cookies are small text files that are stored on your device when you visit websites. They help the website remember your actions and preferences over a period of time, so you do not have to keep re-entering them whenever you come back to the site.
          </p>

          <h3 className="font-bold text-base" style={{ color: '#121212' }}>How We Use Cookies</h3>
          <ul className="list-disc pl-6 space-y-2" style={{ color: '#5C5C5C' }}>
            <li><strong>Essential Cookies:</strong> Required to enable core site functionality, such as user authentication, booking sessions, and secure payment processing.</li>
            <li><strong>Functional Cookies:</strong> Used to remember choices you make (such as your location or selected rental preferences) to provide an optimized experience.</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website, enabling us to measure performance and optimize user flows.</li>
          </ul>

          <h3 className="font-bold text-base" style={{ color: '#121212' }}>Managing Your Preferences</h3>
          <p style={{ color: '#5C5C5C' }}>
            Most web browsers allow you to control cookies through their settings preferences. However, limiting cookies may affect your ability to complete vehicle bookings or access personalized features on this site.
          </p>

          <h3 className="font-bold text-base" style={{ color: '#121212' }}>Contact Us</h3>
          <p style={{ color: '#5C5C5C' }}>
            If you have any questions about our use of cookies, please contact us at{' '}
            <a href="tel:+919004460634" className="font-semibold no-underline" style={{ color: '#121212' }}>+91 90044 60634</a> / <a href="tel:+918469265000" className="font-semibold no-underline" style={{ color: '#121212' }}>+91 8469265000</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
