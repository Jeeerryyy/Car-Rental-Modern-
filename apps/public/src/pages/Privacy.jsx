import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <main id="main-content" className="min-h-screen pt-12 pb-24" style={{ background: '#F9F8F3' }}>
      <div className="max-w-[800px] mx-auto px-6 lg:px-10">
        <nav className="text-sm mb-8 flex gap-2" aria-label="Breadcrumb">
          <Link to="/" className="no-underline" style={{ color: '#6b5e50' }}>Home</Link>
          <span style={{ color: '#6b5e50' }}>/</span>
          <span className="font-semibold" style={{ color: '#19130E' }}>Privacy Policy</span>
        </nav>

        <h1 className="font-display text-4xl font-bold mb-6" style={{ color: '#19130E' }}>Privacy Policy</h1>

        <div className="rounded-[12px] p-8 space-y-6 text-sm leading-relaxed" style={{ background: '#F2EEE5', color: '#19130E', border: '1px solid rgba(182,124,61,0.15)' }}>
          <p>Modern Selfdrive Car is committed to protecting your privacy.</p>

          <h3 className="font-bold text-base" style={{ color: '#19130E' }}>Information We Collect</h3>
          <ul className="list-disc pl-6 space-y-2" style={{ color: '#6b5e50' }}>
            <li>Name, email, and phone number — for booking confirmations and customer support.</li>
            <li>Driving license details — for vehicle rental verification.</li>
            <li>Payment information — processed securely through our payment partners.</li>
          </ul>

          <h3 className="font-bold text-base" style={{ color: '#19130E' }}>How We Use Your Data</h3>
          <p style={{ color: '#6b5e50' }}>We collect only the information needed to process your booking. Your data is never sold to third parties.</p>

          <h3 className="font-bold text-base" style={{ color: '#19130E' }}>Contact</h3>
          <p style={{ color: '#6b5e50' }}>
            For any privacy concerns, reach us at{' '}
            <a href="tel:+918792492717" className="font-semibold no-underline" style={{ color: '#19130E' }}>+91 87924 92717</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
