import { Link } from 'react-router-dom';
import { LocationIcon, MailIcon, PhoneIcon } from '../ui/Icons';

const BUSINESS_NAME = 'Modern Selfdrive Car';
const ADDRESS = 'Junagadh, Gujarat';
const EMAIL = 'booking@modernselfdrive.in';
const PHONE = '+91 87924 92717';

function Footer() {


  return (
    <footer role="contentinfo" className="bg-dark text-white pt-20 pb-10 relative border-t border-dark-alt">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] gap-12 lg:gap-24 mb-20">

          <div className="max-w-xs">
            <Link to="/" className="no-underline group flex flex-col -space-y-1.5 mb-8 text-left" aria-label={`${BUSINESS_NAME} home`}>
              <span className="text-[24px] font-black tracking-tight text-white leading-tight group-hover:text-accent transition-colors uppercase">
                Modern
              </span>
              <span className="text-[11px] font-bold tracking-[0.25em] text-gray-400 uppercase">
                Selfdrive Car
              </span>
            </Link>
            <p className="text-[15px] text-gray-400 leading-relaxed font-medium">
              Junagadh's most trusted vehicle rental platform since 2017. Luxury, comfort, and reliability in every journey.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-8">Navigation</h4>
            <ul className="flex flex-col gap-4 text-[14px] font-medium text-gray-300">
              <li><Link to="/cars" className="hover:text-white transition-colors">Browse Fleet</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-accent mb-8">Contact Information</h4>
            <ul className="flex flex-col gap-5 text-[14px] font-medium text-gray-300">
              <li className="flex gap-3 items-start">
                <LocationIcon className="w-5 h-5 text-accent/60 flex-shrink-0 mt-0.5" />
                <span>{ADDRESS}</span>
              </li>
              <li className="flex gap-3 items-center">
                <MailIcon className="w-5 h-5 text-accent/60 flex-shrink-0" />
                <span>{EMAIL}</span>
              </li>
              <li className="flex gap-3 items-center">
                <PhoneIcon className="w-5 h-5 text-accent/60 flex-shrink-0" />
                <span>{PHONE}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[12px] font-medium text-gray-500">
            <p>&copy; {new Date().getFullYear()} Modern Selfdrive Car. All rights reserved.</p>
            <div className="flex gap-8">
              <Link to="/terms" className="hover:text-gray-300 transition-colors uppercase tracking-widest">Terms</Link>
              <Link to="/privacy" className="hover:text-gray-300 transition-colors uppercase tracking-widest">Privacy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
