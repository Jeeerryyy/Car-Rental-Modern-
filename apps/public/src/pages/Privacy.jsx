import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <main id="main-content" className="min-h-screen pt-12 pb-24" style={{ background: '#F4F1EA' }}>
      <div className="max-w-[800px] mx-auto px-6 lg:px-10">
        <nav className="text-sm mb-8 flex gap-2" aria-label="Breadcrumb">
          <Link to="/" className="no-underline" style={{ color: '#5C5C5C' }}>Home</Link>
          <span style={{ color: '#5C5C5C' }}>/</span>
          <span className="font-semibold" style={{ color: '#121212' }}>Privacy Policy</span>
        </nav>

        <h1 className="font-display text-4xl font-bold mb-6" style={{ color: '#121212' }}>Privacy Policy</h1>

        <div className="rounded-[12px] p-8 space-y-6 text-sm leading-relaxed" style={{ background: '#E7E0D4', color: '#121212', border: '1px solid #D6D0C7' }}>
          <p>Modern Selfdrive Car is committed to protecting your privacy.</p>

          <h3 className="font-bold text-base" style={{ color: '#121212' }}>Information We Collect</h3>
          <ul className="list-disc pl-6 space-y-2" style={{ color: '#5C5C5C' }}>
            <li>Name, email, and phone number — for booking confirmations and customer support.</li>
            <li>Driving license details — for vehicle rental verification.</li>
            <li>Payment information — processed securely through our payment partners.</li>
          </ul>

          <h3 className="font-bold text-base" style={{ color: '#121212' }}>How We Use Your Data</h3>
          <p style={{ color: '#5C5C5C' }}>We collect only the information needed to process your booking. Your data is never sold to third parties.</p>

          <h3 className="font-bold text-base" style={{ color: '#121212' }}>Contact</h3>
          <p style={{ color: '#5C5C5C' }}>
            For any privacy concerns, reach us at{' '}
            <a href="tel:+919004460634" className="font-semibold no-underline" style={{ color: '#121212' }}>+91 90044 60634</a> / <a href="tel:+918469265000" className="font-semibold no-underline" style={{ color: '#121212' }}>+91 8469265000</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
