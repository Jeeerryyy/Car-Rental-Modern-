import ContactMethods from '../components/contact/ContactMethods';
import ContactForm from '../components/contact/ContactForm';

const Contact = () => {
  return (
    <div className="min-h-screen pt-12 pb-24" style={{ background: '#F4F1EA' }}>
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
