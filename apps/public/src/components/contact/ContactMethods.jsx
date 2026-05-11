import React from 'react';
import { 
  PhoneIcon, 
  MailIcon, 
  LocationIcon, 
  WhatsAppIcon, 
  InstagramIcon,
  FacebookIcon,
  MapIcon
} from '../ui/Icons';

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

export default function ContactMethods() {
  return (
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
  );
}
