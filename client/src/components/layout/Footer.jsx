import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { LocationIcon, MailIcon, PhoneIcon, ArrowRightIcon } from '../ui/Icons';

function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const subscribe = useCallback(async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.post('/api/newsletter/subscribe', { email });
      setStatus('done');
      setEmail('');
      setTimeout(() => setStatus('idle'), 4000);
    } catch {
      setStatus('idle');
    }
  }, [email]);

  // Secret watermark - hidden metadata accessible via console
  useEffect(() => {
    // Set hidden watermark data for verification
    window.__WATERMARK__ = {
      project: 'Modern Selfdrive Car',
      version: '1.0.0',
      protected: true,
      timestamp: Date.now()
    };
  }, []);

  return (
    <footer role="contentinfo" className="bg-[#111118] text-white pt-14 pb-6 relative">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand — clean text mark, matches Navbar */}
          <div>
            <Link to="/" className="no-underline mb-6 inline-block" aria-label="Modern Selfdrive Car home">
              <span className="text-[17px] font-bold tracking-tight text-white leading-none">
                Modern Selfdrive Car
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mt-3">
              Junagadh&apos;s most trusted self drive car rental since 2017. Cars with &amp; without driver. Airport pickup. Bike rentals.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li className="flex gap-2 items-start">
                <LocationIcon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                GIDC 1, Joshipara, Junagadh - 362002, Gujarat
              </li>
              <li className="flex gap-2 items-center">
                <MailIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                booking@modernselfdrive.in
              </li>
              <li className="flex gap-2 items-center">
                <PhoneIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                +91 87924 92717
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-6">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">Subscribe for updates and exclusive offers.</p>

            {status === 'done' ? (
              <div className="bg-green-900/30 border border-green-700 text-green-400 text-sm font-semibold rounded px-4 py-3">
                ✓ Subscribed!
              </div>
            ) : (
              <form onSubmit={subscribe} className="flex border border-gray-700 rounded overflow-hidden focus-within:border-white transition-colors">
                <label htmlFor="footer-email" className="sr-only">Email</label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  maxLength={254}
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-sm text-white px-4 py-2 outline-none w-full"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-white text-dark px-3 py-2 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
                  aria-label="Subscribe"
                >
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          {/* Secret watermark - straight line under the dividing line */}
          <div className="text-center pointer-events-none opacity-[0.02] whitespace-nowrap text-[9px] text-gray-400 font-mono py-2" aria-hidden="true">
            MODERN SELFDRIVE PROTECTED
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 pt-4">
            <p>&copy; {new Date().getFullYear()} Modern Selfdrive Car. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
