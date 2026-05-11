import ContactMethods from '../components/contact/ContactMethods';
import ContactForm from '../components/contact/ContactForm';

const Contact = () => {
  return (
    <div className="bg-off min-h-screen pt-12 pb-24">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-dark tracking-tight mb-6">
            Get in Touch
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            Have questions about our fleet or booking process? We're here to help. Reach out via any channel below or visit our office in Junagadh.
          </p>
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
