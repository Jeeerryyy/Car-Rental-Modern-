import ContactMethods from '../components/contact/ContactMethods';
import ContactForm from '../components/contact/ContactForm';
import SEO from '../components/SEO';

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Modern Selfdrive Car — Junagadh, Gujarat",
  "url": "https://modernselfdrive.in/contact",
  "description": "Contact Modern Selfdrive Car for car rental bookings, inquiries, and support. Located in Junagadh, Gujarat. Available 24/7 on call and WhatsApp.",
  "mainEntity": {
    "@type": "AutoRental",
    "name": "Modern Selfdrive Car",
    "telephone": "+918792492717",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Kalwa Chowk",
      "addressLocality": "Junagadh",
      "addressRegion": "Gujarat",
      "postalCode": "362001",
      "addressCountry": "IN"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    }
  }
};

const Contact = () => {
  return (
    <div className="min-h-screen pt-12 pb-24" style={{ background: '#F4F1EA' }}>
      <SEO
        title="Contact Us | Modern Selfdrive Car — Junagadh, Gujarat"
        description="Get in touch with Modern Selfdrive Car in Junagadh, Gujarat. Call, WhatsApp, or email us for self drive car & bike rental bookings. 24/7 available support."
        keywords={['contact modern selfdrive', 'car rental junagadh contact', 'self drive car phone number gujarat', 'modern selfdrive whatsapp']}
        canonical="https://modernselfdrive.in/contact"
        schema={contactSchema}
      />
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mb-16">
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mb-6" style={{ color: '#121212' }}>Get in Touch</h1>
          <p className="text-lg leading-relaxed" style={{ color: '#5C5C5C' }}>Have questions about our fleet or booking process? We're here to help. Reach out via any channel below or visit our office in Junagadh.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <ContactMethods />
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default Contact;
