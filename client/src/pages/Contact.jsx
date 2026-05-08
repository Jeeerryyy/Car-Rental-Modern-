import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { 
  PhoneIcon, 
  MailIcon, 
  LocationIcon, 
  WhatsAppIcon, 
  InstagramIcon,
  FacebookIcon,
  MapIcon,
  CheckIcon,
  ExploreIcon
} from '../components/ui/Icons';

const Contact = () => {
  const [formState, setFormState] = useState('idle'); // idle | sending | success

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormState('sending');
    
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message')
    };

    try {
      await axiosInstance.post('/contact', data);
      setFormState('success');
      e.target.reset();
      setTimeout(() => setFormState('idle'), 5000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
      setFormState('idle');
    }
  };

  const SOCIAL_LINKS = [
    { 
      name: 'WhatsApp', 
      icon: <WhatsAppIcon className="w-5 h-5" />, 
      link: 'https://wa.me/918792492717',
      label: '+91 87924 92717',
      color: 'text-[#25D366] hover:bg-green-50'
    },
    { 
      name: 'Instagram', 
      icon: <InstagramIcon className="w-5 h-5" />, 
      link: 'https://instagram.com/modernselfdrive',
      label: '@modernselfdrive',
      color: 'text-[#E4405F] hover:bg-pink-50'
    },
    { 
      name: 'Facebook', 
      icon: <FacebookIcon className="w-5 h-5" />, 
      link: 'https://facebook.com/modernselfdrive',
      label: 'Modern Selfdrive',
      color: 'text-[#1877F2] hover:bg-blue-50'
    },
    { 
      name: 'Google Maps', 
      icon: <MapIcon className="w-5 h-5" />, 
      link: 'https://g.page/modern-selfdrive',
      label: 'Visit our Office',
      color: 'text-dark hover:bg-off'
    }
  ];

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
          
          {/* Left Column: Contact Methods */}
          <div className="lg:col-span-5 space-y-12">
            
            {/* Contact Cards */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white p-8 rounded-[var(--radius-lg)] border border-border shadow-sm flex items-start gap-6 group hover:border-dark transition-colors">
                <div className="w-12 h-12 rounded-full bg-off flex items-center justify-center text-dark flex-shrink-0 group-hover:bg-dark group-hover:text-white transition-colors">
                  <PhoneIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Call Us</p>
                  <a href="tel:+918792492717" className="text-xl font-bold text-dark hover:underline">+91 87924 92717</a>
                  <p className="text-sm text-muted mt-1">Available 24/7 for support</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[var(--radius-lg)] border border-border shadow-sm flex items-start gap-6 group hover:border-dark transition-colors">
                <div className="w-12 h-12 rounded-full bg-off flex items-center justify-center text-dark flex-shrink-0 group-hover:bg-dark group-hover:text-white transition-colors">
                  <MailIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Email Us</p>
                  <a href="mailto:booking@modernselfdrive.in" className="text-xl font-bold text-dark hover:underline">booking@modernselfdrive.in</a>
                  <p className="text-sm text-muted mt-1">Response within 24 hours</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[var(--radius-lg)] border border-border shadow-sm flex items-start gap-6 group hover:border-dark transition-colors">
                <div className="w-12 h-12 rounded-full bg-off flex items-center justify-center text-dark flex-shrink-0 group-hover:bg-dark group-hover:text-white transition-colors">
                  <LocationIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Office</p>
                  <address className="text-lg font-bold text-dark not-italic leading-tight">
                    GIDC 1, Joshipara,<br/>Junagadh - 362002, Gujarat
                  </address>
                </div>
              </div>
            </div>

            {/* Social Links Grid */}
            <div>
              <h3 className="text-sm font-bold text-dark uppercase tracking-widest mb-6">Social Connect</h3>
              <div className="grid grid-cols-2 gap-4">
                {SOCIAL_LINKS.map((social) => (
                  <a 
                    key={social.name} 
                    href={social.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className={`flex items-center gap-3 p-4 rounded-md border border-border bg-white transition-all ${social.color}`}
                  >
                    {social.icon}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{social.name}</span>
                      <span className="text-sm font-bold text-dark">{social.label}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-12 rounded-[var(--radius-xl)] border border-border shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="font-display text-3xl font-bold text-dark mb-2">Send us a message</h2>
                <p className="text-muted mb-10 font-medium text-sm">Our team typically responds within a few business hours. Please provide your details below.</p>

                {formState === 'success' ? (
                  <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckIcon className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-dark mb-2">Message Received</h3>
                    <p className="text-muted">Thank you for reaching out. We have received your inquiry and will be in touch shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <label htmlFor="name" className="text-[13px] font-bold text-dark uppercase tracking-widest">Your Full Name</label>
                        <input 
                          id="name" required type="text" placeholder="Enter your full name"
                          className="w-full bg-off border border-border px-5 py-4 rounded-md outline-none focus:border-dark focus:bg-white transition-all font-medium text-dark"
                        />
                      </div>
                      <div className="space-y-2.5">
                        <label htmlFor="email" className="text-[13px] font-bold text-dark uppercase tracking-widest">Email Address</label>
                        <input 
                          id="email" required type="email" placeholder="Enter your email address"
                          className="w-full bg-off border border-border px-5 py-4 rounded-md outline-none focus:border-dark focus:bg-white transition-all font-medium text-dark"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2.5">
                      <label htmlFor="subject" className="text-[13px] font-bold text-dark uppercase tracking-widest">How can we help?</label>
                      <div className="relative">
                        <select 
                          id="subject"
                          className="w-full bg-off border border-border px-5 py-4 rounded-md outline-none focus:border-dark focus:bg-white transition-all font-medium text-dark appearance-none cursor-pointer"
                        >
                          <option>General Inquiry</option>
                          <option>Vehicle Availability & Pricing</option>
                          <option>Corporate & Bulk Bookings</option>
                          <option>Technical Support</option>
                          <option>Feedback & Suggestions</option>
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                          <ExploreIcon className="w-4 h-4 opacity-30" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <label htmlFor="message" className="text-[13px] font-bold text-dark uppercase tracking-widest">Message Details</label>
                      <textarea 
                        id="message" required rows="5" placeholder="Please describe your requirement or question..."
                        className="w-full bg-off border border-border px-5 py-4 rounded-md outline-none focus:border-dark focus:bg-white transition-all font-medium text-dark resize-none"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={formState === 'sending'}
                      className="w-full bg-dark text-white font-bold py-5 rounded-md hover:opacity-90 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formState === 'sending' ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </form>
                )}
              </div>
              
              {/* Decorative background element */}
              <div className="absolute -bottom-20 -right-20 opacity-[0.03] pointer-events-none">
                <ExploreIcon className="w-96 h-96" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;
