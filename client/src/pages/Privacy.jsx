import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <main id="main-content" className="bg-off min-h-screen pt-12 pb-24">
      <div className="max-w-[800px] mx-auto px-6 lg:px-10">
        <nav className="text-sm text-muted mb-8 flex gap-2" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-dark">Home</Link>
          <span>/</span>
          <span className="text-dark font-semibold">Privacy Policy</span>
        </nav>

        <h1 className="font-display text-4xl font-bold text-dark mb-6">Privacy Policy</h1>

        <div className="bg-white rounded-[var(--radius-md)] p-8 shadow-sm border border-border space-y-6 text-sm text-dark leading-relaxed">
          <p>Modern Selfdrive Car is committed to protecting your privacy.</p>

          <h3 className="font-bold text-base">Information We Collect</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted">
            <li>Name, email, and phone number — for booking confirmations and customer support.</li>
            <li>Driving license details — for vehicle rental verification.</li>
            <li>Payment information — processed securely through our payment partners.</li>
          </ul>

          <h3 className="font-bold text-base">How We Use Your Data</h3>
          <p className="text-muted">We collect only the information needed to process your booking. Your data is never sold to third parties.</p>

          <h3 className="font-bold text-base">Contact</h3>
          <p className="text-muted">
            For any privacy concerns, reach us at{' '}
            <a href="tel:+918792492717" className="text-dark font-semibold hover:underline">+91 87924 92717</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
