import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done

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

  return (
    <footer role="contentinfo" className="bg-[#111118] text-white pt-20 pb-8">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">

          {/* brand */}
          <div>
            <Link to="/" className="flex flex-col leading-none no-underline mb-6 inline-block">
              <span className="text-[18px] font-extrabold tracking-[-0.5px] text-white">MODERN</span>
              <span className="text-[10px] font-medium tracking-[2.5px] text-gray-400 uppercase mt-0.5">SELFDRIVE CAR</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Junagadh's most trusted self drive car rental since 2017. Cars with & without driver. Airport pickup. Bike rentals.
            </p>
          </div>

          {/* links */}
          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* contact */}
          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li className="flex gap-2 items-start"><span className="material-symbols-outlined text-[18px]">location_on</span>GIDC 1, Joshipara, Junagadh - 362002, Gujarat</li>
              <li className="flex gap-2 items-center"><span className="material-symbols-outlined text-[18px]">mail</span>booking@modernselfdrive.in</li>
              <li className="flex gap-2 items-center"><span className="material-symbols-outlined text-[18px]">call</span>+91 87924 92717</li>
            </ul>
          </div>

          {/* newsletter */}
          <div>
            <h4 className="text-white font-bold mb-6">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">Subscribe for updates and exclusive offers.</p>

            {status === 'done' ? (
              <div className="bg-green-900/30 border border-green-700 text-green-400 text-sm font-semibold rounded px-4 py-3">✓ Subscribed!</div>
            ) : (
              <form onSubmit={subscribe} className="flex border border-gray-700 rounded overflow-hidden focus-within:border-white transition-colors">
                <label htmlFor="footer-email" className="sr-only">Email</label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-sm text-white px-4 py-2 outline-none w-full"
                />
                <button type="submit" disabled={status === 'loading'} className="bg-white text-dark px-3 py-2 flex items-center justify-center hover:bg-gray-200 transition-colors" aria-label="Subscribe">
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Modern Selfdrive Car. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
