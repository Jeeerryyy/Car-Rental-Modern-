import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { promoAPI } from '../../services/api';

export default function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [promo, setPromo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch featured promo from API
    const fetchPromo = async () => {
      try {
        const res = await promoAPI.getFeatured();
        if (res.data?.data?.promo) {
          setPromo(res.data.data.promo);
        } else {
          setPromo(null);
        }
      } catch (err) {
        console.warn('Could not fetch promo from API, defaulting to welcome message.', err);
        setPromo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPromo();

    // 2. Check session storage to show only once per session
    const hasSeen = sessionStorage.getItem('hasSeenPromoPopup');
    if (!hasSeen) {
      // 2.2s delay allows the site's initial loading screen (1.6s) to finish completely
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('hasSeenPromoPopup', 'true');
    setIsOpen(false);
  };

  const handleCopy = () => {
    if (promo?.code) {
      navigator.clipboard.writeText(promo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-[24px] border p-8 md:p-10 shadow-2xl text-center z-10"
            style={{
              background: '#F8F6F1',
              borderColor: '#D6D0C7',
            }}
            role="dialog"
            aria-modal="true"
          >
            {/* Fine dashed decorative inner border */}
            <div className="absolute inset-3 rounded-[18px] border border-dashed border-[#D6D0C7]/70 pointer-events-none" />

            {/* Cut/Close Option in Top Right */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 z-20 w-8 h-8 rounded-full flex items-center justify-center border border-[#D6D0C7] hover:border-[#A56A43] hover:text-[#A56A43] transition-colors duration-200 cursor-pointer"
              style={{ color: '#5C5C5C', background: '#F8F6F1' }}
              aria-label="Close popup"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {promo ? (
              /* LAYOUT A: Promo Offer Displayed */
              <div className="relative z-10 flex flex-col items-center mt-4">
                {/* Badge */}
                <span 
                  className="text-[9px] font-black tracking-[0.25em] uppercase px-3 py-1 rounded-full mb-4 border border-[#A56A43]/20"
                  style={{ color: '#A56A43', backgroundColor: 'rgba(165,106,67,0.06)' }}
                >
                  [ {promo.title || 'LIMITED PROMO'} ]
                </span>

                {/* Title / Discount display */}
                <h2 className="text-3xl font-black tracking-tight mb-2 font-display uppercase text-[#121212] leading-tight">
                  Get{' '}
                  <span style={{ color: '#A56A43' }}>
                    {promo.discountType === 'fixed' ? '₹' : ''}
                    {promo.discountValue}
                    {promo.discountType === 'percentage' ? '%' : ''}
                  </span>{' '}
                  Off
                </h2>

                {/* Description */}
                <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: '#5C5C5C' }}>
                  {promo.description}
                </p>

                {/* Promo Code Copy Card */}
                <div 
                  className="w-full rounded-[16px] border border-[#D6D0C7] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6"
                  style={{ backgroundColor: '#F4F1EA' }}
                >
                  <div className="text-left w-full sm:w-auto">
                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: '#8B8B8B' }}>
                      Promo Code
                    </span>
                    <span className="text-lg font-black tracking-widest uppercase font-mono text-[#121212]">
                      {promo.code}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleCopy}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    style={{
                      backgroundColor: copied ? '#556B57' : '#141414',
                      color: '#F8F6F1',
                    }}
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy Code
                      </>
                    )}
                  </button>
                </div>

                {/* Bottom dismissal link */}
                <button
                  onClick={handleClose}
                  className="text-[11px] font-bold uppercase tracking-widest underline decoration-1 hover:text-[#A56A43] transition-colors duration-200 cursor-pointer"
                  style={{ color: '#8B8B8B' }}
                >
                  Continue to website
                </button>
              </div>
            ) : (
              /* LAYOUT B: Welcome Message Displayed (When no active promo exists) */
              <div className="relative z-10 flex flex-col items-center mt-4">
                {/* Badge */}
                <span 
                  className="text-[9px] font-black tracking-[0.25em] uppercase px-3 py-1 rounded-full mb-5 border border-[#A56A43]/20"
                  style={{ color: '#A56A43', backgroundColor: 'rgba(165,106,67,0.06)' }}
                >
                  [ WELCOME GUEST ]
                </span>

                {/* Title */}
                <h2 className="text-3xl font-black tracking-tight mb-3 font-display uppercase text-[#121212] leading-tight">
                  Your Journey <span style={{ color: '#A56A43' }}>Begins Here</span>
                </h2>

                {/* Description */}
                <p className="text-sm leading-relaxed mb-8 max-w-sm" style={{ color: '#5C5C5C' }}>
                  Experience the premium self-drive experience in Junagadh. Select from our wide range of sanitized cars, SUVs, and bikes. Rentals are available with or without drivers at the best prices.
                </p>

                {/* CTA Button */}
                <Link
                  to="/cars"
                  onClick={handleClose}
                  className="w-full px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 bg-[#141414] text-[#F8F6F1] hover:bg-[#A56A43] hover:text-[#F8F6F1] shadow-md flex items-center justify-center gap-2 cursor-pointer mb-5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  Explore Fleet
                </Link>

                {/* Dismiss Link */}
                <button
                  onClick={handleClose}
                  className="text-[11px] font-bold uppercase tracking-widest underline decoration-1 hover:text-[#A56A43] transition-colors duration-200 cursor-pointer"
                  style={{ color: '#8B8B8B' }}
                >
                  Continue to website
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
