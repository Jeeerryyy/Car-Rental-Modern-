import { Link } from 'react-router-dom';
import { LocationIcon, MailIcon, PhoneIcon } from '../ui/Icons';

const BUSINESS_NAME = 'modern self drive';
const ADDRESS = 'Junagadh, Gujarat';
const EMAIL = 'booking@modernselfdrive.in';
const PHONE = '+91 90044 60634';

function Footer() {


  return (
    <footer role="contentinfo" className="pt-20 pb-10 relative" style={{ background: '#19130E', borderTop: '1px solid #2a2118' }}>
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] gap-12 lg:gap-24 mb-20">

          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-3 no-underline leading-tight mb-8" aria-label={`${BUSINESS_NAME} home`}>
              <img src="/irck-removebg-preview.png" alt="Logo" className="h-10 w-auto object-contain" />
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter uppercase leading-none" style={{ color: '#F9F8F3' }}>modern</span>
                <span className="text-sm font-bold tracking-tight uppercase leading-none" style={{ color: '#B67C3D' }}>self drive</span>
              </div>
            </Link>
            <p className="text-[15px] leading-relaxed font-medium" style={{ color: '#8a7d6f' }}>
              Junagadh's most trusted vehicle rental platform since 2017. Luxury, comfort, and reliability in every journey.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8" style={{ color: '#B67C3D' }}>Navigation</h4>
            <ul className="flex flex-col gap-4 text-[14px] font-medium" style={{ color: '#8a7d6f' }}>
              <li><Link to="/cars" className="no-underline" style={{ color: '#8a7d6f' }}>Browse Fleet</Link></li>
              <li><Link to="/contact" className="no-underline" style={{ color: '#8a7d6f' }}>Contact Support</Link></li>
              <li><Link to="/terms" className="no-underline" style={{ color: '#8a7d6f' }}>Terms of Service</Link></li>
              <li><Link to="/privacy" className="no-underline" style={{ color: '#8a7d6f' }}>Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8" style={{ color: '#B67C3D' }}>Contact Information</h4>
            <ul className="flex flex-col gap-5 text-[14px] font-medium" style={{ color: '#8a7d6f' }}>
              <li className="flex gap-3 items-start">
                <LocationIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgba(182,124,61,0.6)' }} />
                <span>{ADDRESS}</span>
              </li>
              <li className="flex gap-3 items-center">
                <MailIcon className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(182,124,61,0.6)' }} />
                <span>{EMAIL}</span>
              </li>
              <li className="flex gap-3 items-center">
                <PhoneIcon className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(182,124,61,0.6)' }} />
                <span>{PHONE}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10" style={{ borderTop: '1px solid rgba(220,207,186,0.08)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[12px] font-medium" style={{ color: '#6b5e50' }}>
            <p>&copy; {new Date().getFullYear()} modern self drive. All rights reserved.</p>
            <div className="flex gap-8">
              <Link to="/terms" className="uppercase tracking-widest no-underline" style={{ color: '#6b5e50' }}>Terms</Link>
              <Link to="/privacy" className="uppercase tracking-widest no-underline" style={{ color: '#6b5e50' }}>Privacy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
