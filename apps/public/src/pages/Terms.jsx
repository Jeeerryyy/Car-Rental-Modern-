import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <main id="main-content" className="min-h-screen pt-12 pb-24" style={{ background: '#F4F1EA' }}>
      <div className="max-w-[800px] mx-auto px-6 lg:px-10">
        <nav className="text-sm mb-8 flex gap-2" aria-label="Breadcrumb">
          <Link to="/" className="no-underline" style={{ color: '#5C5C5C' }}>Home</Link>
          <span style={{ color: '#5C5C5C' }}>/</span>
          <span className="font-semibold" style={{ color: '#121212' }}>Terms & Conditions</span>
        </nav>

        <h1 className="font-display text-4xl font-bold mb-6" style={{ color: '#121212' }}>Terms & Conditions</h1>

        <div className="rounded-[12px] p-8 space-y-6 text-sm leading-relaxed" style={{ background: '#E7E0D4', color: '#121212', border: '1px solid #D6D0C7' }}>
          <p>By using the Modern Selfdrive Car platform, you agree to the following general terms:</p>
          <ul className="list-disc pl-6 space-y-2" style={{ color: '#5C5C5C' }}>
            <li>You must possess a valid Indian driving license to rent a self-drive vehicle.</li>
            <li>A refundable security deposit is required at the time of vehicle pickup.</li>
            <li>The vehicle must be returned in the same condition as received.</li>
            <li>Fuel costs during the rental period are the renter's responsibility.</li>
            <li>Cancellations made 24 hours before pickup are eligible for a full refund.</li>
          </ul>
          <p style={{ color: '#5C5C5C' }}>
            For detailed queries, contact us at{' '}
            <a href="tel:+919004460634" className="font-semibold no-underline" style={{ color: '#121212' }}>+91 90044 60634</a> / <a href="tel:+918469265000" className="font-semibold no-underline" style={{ color: '#121212' }}>+91 8469265000</a> or via{' '}
            <a href="https://wa.me/919004460634" className="font-semibold no-underline" style={{ color: '#A56A43' }} target="_blank" rel="noreferrer">WhatsApp</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
