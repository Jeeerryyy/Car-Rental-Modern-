import React from 'react';
import { PhoneIcon, MailIcon, LocationIcon, WhatsAppIcon, InstagramIcon, FacebookIcon, MapIcon } from '../ui/Icons';

const SOCIAL_LINKS = [
  { name: 'WhatsApp', icon: <WhatsAppIcon className="w-5 h-5" />, link: 'https://wa.me/919004460634', label: '+91 90044 60634' },
  { name: 'Instagram', icon: <InstagramIcon className="w-5 h-5" />, link: 'https://instagram.com/modernselfdrive', label: '@modernselfdrive' },
  { name: 'Facebook', icon: <FacebookIcon className="w-5 h-5" />, link: 'https://facebook.com/modernselfdrive', label: 'Modern Selfdrive' },
  { name: 'Google Maps', icon: <MapIcon className="w-5 h-5" />, link: 'https://g.page/modern-selfdrive', label: 'Visit our Office' },
];

export default function ContactMethods() {
  const cardStyle = { background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)' };
  const iconBg = { background: '#EBE6DE', color: '#19130E' };

  return (
    <div className="lg:col-span-5 space-y-12">
      <div className="grid grid-cols-1 gap-4">
        <div className="p-8 rounded-[12px] flex items-start gap-6" style={cardStyle}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={iconBg}><PhoneIcon className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#6b5e50' }}>Call Us</p>
            <a href="tel:+919004460634" className="text-xl font-bold no-underline" style={{ color: '#19130E' }}>+91 90044 60634</a>
            <p className="text-sm mt-1" style={{ color: '#6b5e50' }}>Available 24/7 for support</p>
          </div>
        </div>
        <div className="p-8 rounded-[12px] flex items-start gap-6" style={cardStyle}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={iconBg}><MailIcon className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#6b5e50' }}>Email Us</p>
            <a href="mailto:booking@modernselfdrive.in" className="text-xl font-bold no-underline" style={{ color: '#19130E' }}>booking@modernselfdrive.in</a>
            <p className="text-sm mt-1" style={{ color: '#6b5e50' }}>Response within 24 hours</p>
          </div>
        </div>
        <div className="p-8 rounded-[12px] flex items-start gap-6" style={cardStyle}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={iconBg}><LocationIcon className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#6b5e50' }}>Office</p>
            <address className="text-lg font-bold not-italic leading-tight" style={{ color: '#19130E' }}>GIDC 1, Joshipara,<br/>Junagadh - 362002, Gujarat</address>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: '#19130E' }}>Social Connect</h3>
        <div className="grid grid-cols-2 gap-4">
          {SOCIAL_LINKS.map((social) => (
            <a key={social.name} href={social.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 rounded-[8px] no-underline" style={cardStyle}>
              <span style={{ color: '#19130E' }}>{social.icon}</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#6b5e50' }}>{social.name}</span>
                <span className="text-sm font-bold" style={{ color: '#19130E' }}>{social.label}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
