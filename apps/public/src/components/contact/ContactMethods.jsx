import React from 'react';
import { PhoneIcon, MailIcon, LocationIcon, WhatsAppIcon, InstagramIcon, FacebookIcon, MapIcon } from '../ui/Icons';

const SOCIAL_LINKS = [
  { name: 'WhatsApp', icon: <WhatsAppIcon className="w-5 h-5" />, link: 'https://wa.me/919004460634', label: '+91 90044 60634' },
  { name: 'WhatsApp 2', icon: <WhatsAppIcon className="w-5 h-5" />, link: 'https://wa.me/918469265000', label: '+91 8469265000' },
  { name: 'Instagram', icon: <InstagramIcon className="w-5 h-5" />, link: 'https://instagram.com/modernselfdrive', label: '@modernselfdrive' },
  { name: 'Facebook', icon: <FacebookIcon className="w-5 h-5" />, link: 'https://facebook.com/modernselfdrive', label: 'Modern Selfdrive' },
  { name: 'Google Maps', icon: <MapIcon className="w-5 h-5" />, link: 'https://g.page/modern-selfdrive', label: 'Visit our Office' },
];

export default function ContactMethods() {
  const cardStyle = { background: '#E7E0D4', border: '1px solid #D6D0C7' };
  const iconBg = { background: '#E7E0D4', color: '#121212' };

  return (
    <div className="lg:col-span-5 space-y-12">
      <div className="grid grid-cols-1 gap-4">
        <div className="p-8 rounded-[12px] flex items-start gap-6" style={cardStyle}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={iconBg}><PhoneIcon className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#5C5C5C' }}>Call Us</p>
            <div className="flex flex-col">
              <a href="tel:+919004460634" className="text-xl font-bold no-underline" style={{ color: '#121212' }}>+91 90044 60634</a>
              <a href="tel:+918469265000" className="text-xl font-bold no-underline" style={{ color: '#121212' }}>+91 8469265000</a>
            </div>
            <p className="text-sm mt-1" style={{ color: '#5C5C5C' }}>Available 24/7 for support</p>
          </div>
        </div>
        <div className="p-8 rounded-[12px] flex items-start gap-6" style={cardStyle}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={iconBg}><MailIcon className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#5C5C5C' }}>Email Us</p>
            <a href="mailto:booking@modernselfdrive.in" className="text-xl font-bold no-underline" style={{ color: '#121212' }}>booking@modernselfdrive.in</a>
            <p className="text-sm mt-1" style={{ color: '#5C5C5C' }}>Response within 24 hours</p>
          </div>
        </div>
        <div className="p-8 rounded-[12px] flex items-start gap-6" style={cardStyle}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={iconBg}><LocationIcon className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#5C5C5C' }}>Office</p>
            <address className="text-lg font-bold not-italic leading-tight" style={{ color: '#121212' }}>GIDC-1 , NEAR MAHAVEER MARBLE,<br/>DOLATPARA,JUNAGADH 362037</address>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: '#121212' }}>Social Connect</h3>
        <div className="grid grid-cols-2 gap-4">
          {SOCIAL_LINKS.map((social) => (
            <a key={social.name} href={social.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 rounded-[8px] no-underline" style={cardStyle}>
              <span style={{ color: '#121212' }}>{social.icon}</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#5C5C5C' }}>{social.name}</span>
                <span className="text-sm font-bold" style={{ color: '#121212' }}>{social.label}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
