import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <main id="main-content" className="bg-off min-h-screen pt-12 pb-24">
      <div className="max-w-[800px] mx-auto px-6 lg:px-10">
        <nav className="text-sm text-muted mb-8 flex gap-2" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-dark">Home</Link>
          <span>/</span>
          <span className="text-dark font-semibold">Terms & Conditions</span>
        </nav>

        <h1 className="font-display text-4xl font-bold text-dark mb-6">Terms & Conditions</h1>

        <div className="bg-white rounded-[var(--radius-md)] p-8 shadow-sm border border-border space-y-6 text-sm text-dark leading-relaxed">
          <p>By using the Modern Selfdrive Car platform, you agree to the following general terms:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted">
            <li>You must possess a valid Indian driving license to rent a self-drive vehicle.</li>
            <li>A refundable security deposit is required at the time of vehicle pickup.</li>
            <li>The vehicle must be returned in the same condition as received.</li>
            <li>Fuel costs during the rental period are the renter's responsibility.</li>
            <li>Cancellations made 24 hours before pickup are eligible for a full refund.</li>
          </ul>
          <p className="text-muted">
            For detailed queries, contact us at{' '}
            <a href="tel:+918792492717" className="text-dark font-semibold hover:underline">+91 87924 92717</a> or via{' '}
            <a href="https://wa.me/918792492717" className="text-[#25D366] font-semibold hover:underline" target="_blank" rel="noreferrer">WhatsApp</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
