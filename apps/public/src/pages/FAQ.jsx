import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const FAQ_DATA = [
  {
    q: 'What is the minimum age to rent a self drive car in Junagadh?',
    a: 'You must be at least 18 years old with a valid Indian driving licence to rent a self drive car from Modern Selfdrive Car in Junagadh, Gujarat.'
  },
  {
    q: 'What documents are required to rent a car?',
    a: 'You need a valid government-issued photo ID (Aadhaar card, Passport, or Voter ID) and a valid driving licence. For outstation trips, an additional address proof may be required.'
  },
  {
    q: 'Can I rent a car for a trip to Gir National Park from Junagadh?',
    a: 'Yes! Gir National Park is only 75 km from Junagadh. We offer self drive and chauffeur-driven cars perfect for a day trip or overnight stay at Gir. Many customers rent our Suzuki Fronx or Ertiga for this trip.'
  },
  {
    q: 'Do you offer car rentals for Somnath Temple visits?',
    a: 'Absolutely. Somnath Temple is 90 km from Junagadh. We have comfortable self drive and driven cars available for Somnath trips. You can book online or call us directly.'
  },
  {
    q: 'What is the daily rental price for a self drive car in Junagadh?',
    a: 'Our prices start from as low as ₹999/day for hatchbacks and go up to ₹3,500/day for premium SUVs. All prices are transparent with no hidden charges. Check our fleet page for current pricing.'
  },
  {
    q: 'Do you offer bike rentals in Junagadh?',
    a: 'Yes, we offer standard bike rentals in Junagadh. Bikes are a great option for solo travelers and are available for self drive at very affordable rates.'
  },
  {
    q: 'Is fuel included in the rental price?',
    a: 'No, fuel is not included in the rental price. The car will be provided with a specific fuel level and must be returned at the same or higher level. This keeps our prices low and fair for everyone.'
  },
  {
    q: 'Can I take the car outside of Gujarat?',
    a: 'Yes, outstation rentals are available. Please inform us at the time of booking if you plan to travel outside Gujarat so we can make the necessary arrangements and provide the required documents.'
  },
  {
    q: 'Is there 24/7 support available?',
    a: 'Yes! We provide 24/7 customer support via phone and WhatsApp. Call us at +91 87924 92717 anytime for assistance with your booking or roadside support.'
  },
  {
    q: 'What happens if the car breaks down during the trip?',
    a: 'In the unlikely event of a breakdown, call us immediately at +91 87924 92717. We will arrange a replacement vehicle or roadside assistance as quickly as possible at no extra cost to you.'
  },
  {
    q: 'Can I book a car with a driver (chauffeur)?',
    a: 'Yes! We offer both self drive and with-driver (chauffeur) options. Chauffeur-driven rentals are popular for weddings, corporate events, airport transfers, and long-distance trips.'
  },
  {
    q: 'How do I book a car at Modern Selfdrive Car?',
    a: 'You can book online through our website at modernselfdrive.in, call us at +91 87924 92717, or message us on WhatsApp. Online booking is available 24/7 with instant confirmation.'
  },
  {
    q: 'Do you offer airport pickup and drop services?',
    a: 'Yes, we offer airport pickup and drop services for Keshod Airport (near Junagadh) and other nearby airports. Book in advance to ensure availability.'
  },
  {
    q: 'What car models are available for rent?',
    a: 'Our fleet includes hatchbacks like Maruti Swift, sedans, SUVs like Suzuki Fronx and Maruti Ertiga, and premium 4WD vehicles like Thar. We also have standard bikes. Check our fleet page for current availability.'
  },
  {
    q: 'Is there a security deposit required?',
    a: 'Yes, a refundable security deposit is collected at the time of pickup. The exact amount depends on the vehicle category. The deposit is fully refunded upon safe return of the vehicle in its original condition.'
  },
  {
    q: 'How far in advance should I book?',
    a: 'We recommend booking at least 24–48 hours in advance, especially during peak tourist season (October to March) and holidays. Instant bookings are also accepted subject to availability.'
  },
  {
    q: 'Do you serve Diu and Dwarka from Junagadh?',
    a: 'Yes! Diu is 135 km from Junagadh and Dwarka is 210 km. Both are popular tourist destinations we regularly serve. Our vehicles are well-maintained and suitable for these longer drives.'
  },
  {
    q: 'Are the cars GPS tracked and insured?',
    a: 'Yes, all our vehicles are comprehensively insured. GPS tracking is available on select vehicles for added safety and peace of mind, especially for outstation and long-distance trips.'
  }
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQ_DATA.map(({ q, a }) => ({
    "@type": "Question",
    "name": q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": a
    }
  }))
};

function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: open ? '#FFFFFF' : '#E7E0D4',
        border: '1px solid #D6D0C7',
        borderRadius: '12px',
        transition: 'background 0.2s',
        marginBottom: '12px'
      }}
    >
      <button
        id={`faq-btn-${index}`}
        aria-expanded={open}
        aria-controls={`faq-ans-${index}`}
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span className="font-bold text-base leading-snug" style={{ color: '#121212' }}>{q}</span>
        <span
          style={{
            minWidth: 28,
            height: 28,
            width: 28,
            borderRadius: '50%',
            background: open ? '#121212' : 'transparent',
            border: `2px solid ${open ? '#121212' : '#D6D0C7'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: open ? '#F8F6F1' : '#5C5C5C',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
        >
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div
          id={`faq-ans-${index}`}
          role="region"
          aria-labelledby={`faq-btn-${index}`}
          className="px-6 pb-6"
          style={{ color: '#5C5C5C', lineHeight: '1.7', fontSize: '0.95rem' }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen pb-24" style={{ background: '#F4F1EA' }}>
      <SEO
        title="Frequently Asked Questions | Modern Selfdrive Car Rental Junagadh, Gujarat"
        description="Got questions about renting a self drive car in Junagadh or Gujarat? Find answers about documents, prices, outstation trips to Gir, Somnath, Diu, Dwarka, and more."
        keywords={['car rental faq junagadh', 'self drive car questions gujarat', 'how to rent car junagadh', 'car rental price gujarat', 'self drive car documents india']}
        canonical="https://modernselfdrive.in/faq"
        schema={faqSchema}
      />

      {/* Hero Banner */}
      <div className="py-16 px-6" style={{ background: '#E7E0D4', borderBottom: '1px solid #D6D0C7' }}>
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase font-mono" style={{ color: '#A56A43' }}>Help Centre</span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mt-3 mb-4" style={{ color: '#121212' }}>
            Frequently Asked Questions
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: '#5C5C5C' }}>
            Everything you need to know about self drive car rentals in Junagadh, Gujarat. Can't find your answer?{' '}
            <Link to="/contact" style={{ color: '#A56A43', textDecoration: 'underline', fontWeight: '600' }}>Contact us</Link>.
          </p>
        </div>
      </div>

      {/* FAQ List */}
      <div className="max-w-3xl mx-auto px-6 lg:px-0 py-14">
        {FAQ_DATA.map((item, i) => (
          <FAQItem key={i} index={i} q={item.q} a={item.a} />
        ))}

        {/* CTA Strip */}
        <div
          className="mt-12 p-8 rounded-[16px] text-center"
          style={{ background: '#121212' }}
        >
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: '#F8F6F1' }}>Still have questions?</h2>
          <p className="mb-6 text-sm" style={{ color: 'rgba(248,246,241,0.6)' }}>Our team is available 24/7 on phone and WhatsApp.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:+918792492717"
              className="px-8 py-3 rounded-[8px] font-bold text-sm uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{ background: '#A56A43', color: '#F8F6F1' }}
            >
              Call Now
            </a>
            <Link
              to="/cars"
              className="px-8 py-3 rounded-[8px] font-bold text-sm uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{ background: 'rgba(248,246,241,0.1)', color: '#F8F6F1', border: '1px solid rgba(248,246,241,0.2)' }}
            >
              Browse Fleet
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
