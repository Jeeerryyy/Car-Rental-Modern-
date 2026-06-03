import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

export default function HeroSection() {
  const { customer } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = 'Hello';
    let suffix = 'Ready for your next journey?';
    
    if (hour < 12) {
      timeGreeting = 'Good morning';
      suffix = 'Ready for a beautiful morning drive?';
    } else if (hour < 17) {
      timeGreeting = 'Good afternoon';
      suffix = 'Ready for a pleasant afternoon trip?';
    } else {
      timeGreeting = 'Good evening';
      suffix = 'Planning a cozy night drive?';
    }
    
    if (customer?.name) {
      const firstName = customer.name.split(' ')[0];
      return `${timeGreeting}, ${firstName}! ${suffix}`;
    }
    return `${timeGreeting}, traveler! ${suffix}`;
  };

  return (
    <section className="relative w-full min-h-[580px] md:min-h-[680px] lg:min-h-[760px] overflow-hidden flex flex-col justify-between py-8"
      style={{ background: '#F4F1EA' }}
    >
      {/* ── Architectural Background Grid Lines ────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Thin Technical Grid Lines */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#D6D0C7]/25"></div>
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#D6D0C7]/25"></div>
        <div className="absolute top-1/4 left-0 right-0 h-[1px] bg-[#D6D0C7]/15"></div>
        <div className="absolute top-3/4 left-0 right-0 h-[1px] bg-[#D6D0C7]/15"></div>
        <div className="absolute top-0 bottom-0 left-1/4 w-[1px] bg-[#D6D0C7]/15"></div>
        <div className="absolute top-0 bottom-0 left-3/4 w-[1px] bg-[#D6D0C7]/15"></div>

        {/* Diagonal Crosshairs */}
        <div className="absolute top-6 left-6 w-4 h-4 border-l border-t border-[#D6D0C7]/40"></div>
        <div className="absolute top-6 right-6 w-4 h-4 border-r border-t border-[#D6D0C7]/40"></div>
        <div className="absolute bottom-6 left-6 w-4 h-4 border-l border-b border-[#D6D0C7]/40"></div>
        <div className="absolute bottom-6 right-6 w-4 h-4 border-r border-b border-[#D6D0C7]/40"></div>


        {/* Giant Architectural Curve Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,100 C30,30 70,30 100,100 Z" fill="none" stroke="#A56A43" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="#D6D0C7" strokeWidth="0.15" strokeDasharray="1 3" />
        </svg>

        {/* Massive Background Circle Framing System */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[480px] md:h-[480px] lg:w-[600px] lg:h-[600px] rounded-full border-[0.5px] border-[#D6D0C7]/40 pointer-events-none flex items-center justify-center"
        >
          <div className="w-[85%] h-[85%] rounded-full border border-dashed border-[#A56A43]/15"></div>
        </motion.div>
      </div>

      {/* ── Upper Margins / Greeting Banner ── */}
      <div className="z-10 text-center select-none pointer-events-none mt-2 lg:mt-4 animate-in fade-in duration-1000">
        <span className="px-5 py-2 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase inline-flex items-center gap-2"
              style={{ background: '#E7E0D4', color: '#121212', border: '1px solid #D6D0C7', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping shrink-0" style={{ backgroundColor: '#A56A43' }}></span>
          {getGreeting()}
        </span>
      </div>

      {/* ── Central Typographic Composition ── */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-center z-10 px-6">
        {/* Left Side Supporting Word Block */}
        <motion.div 
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-4 md:left-12 lg:left-20 top-1/2 -translate-y-1/2 flex flex-col text-left select-none pointer-events-none z-10"
        >
          <span className="text-[9px] font-bold text-[#A56A43] tracking-[0.25em] mb-1 font-mono">[01 / PROPULSION]</span>
          <span className="text-lg md:text-2xl font-extrabold tracking-tight text-[#121212] uppercase leading-none font-display">MODERN</span>
          <span className="text-lg md:text-2xl font-extrabold tracking-tight text-[#121212] uppercase leading-none font-display mt-1">EDITION</span>
        </motion.div>

        {/* Main Composition Box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-[240px] h-[240px] md:w-[360px] md:h-[360px] lg:w-[460px] lg:h-[460px] flex items-center justify-center"
        >
          
          {/* Circular Architectural Cutout/Surface */}
          <div className="absolute inset-0 rounded-full border-[0.5px] border-[#D6D0C7] bg-[#F8F6F1] shadow-[inset_0_4px_24px_rgba(25,19,14,0.02)] overflow-hidden flex items-center justify-center">
            {/* Soft Shadow Circle Behind Car */}
            <div className="absolute w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-[#E7E0D4]/30 to-[#F8F6F1] pointer-events-none"></div>

            {/* Generated Luxury Vehicle - Partially Masked and Fused */}
            <motion.img 
              initial={{ opacity: 0, x: '10%', y: '10%' }}
              animate={{ opacity: 1, x: '4%', y: '4%' }}
              transition={{ duration: 1.0, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              src="/luxury_car_render.png" 
              alt="Premium Vehicle" 
              className="absolute w-[112%] max-w-none h-auto object-contain z-10 select-none pointer-events-none filter drop-shadow-[0_20px_40px_rgba(25,19,14,0.12)]"
            />
          </div>

          {/* Central Oversized Dominant Word */}
          <h1 className="absolute text-[72px] md:text-[130px] lg:text-[170px] font-black tracking-[-0.05em] text-[#121212] leading-none uppercase select-none pointer-events-none z-20 mix-blend-normal opacity-[0.92]">
            DRIVE
          </h1>

          {/* Decorative Technical Reticle Ticks */}
          <div className="absolute top-0 w-3 h-[1px] bg-[#A56A43] z-20"></div>
          <div className="absolute bottom-0 w-3 h-[1px] bg-[#A56A43] z-20"></div>
          <div className="absolute left-0 h-3 w-[1px] bg-[#A56A43] z-20"></div>
          <div className="absolute right-0 h-3 w-[1px] bg-[#A56A43] z-20"></div>
        </motion.div>

        {/* Browse Fleet Button Under the Car Image */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 md:mt-10 lg:mt-12 z-20"
        >
          <Link to="/cars" className="animate-btn whitespace-nowrap justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" height="18" width="18" className="shrink-0 transition-transform">
              <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" />
            </svg>
            <span>Browse Full Fleet</span>
          </Link>
        </motion.div>

        {/* Right Side Supporting Word Block */}
        <motion.div 
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-4 md:right-12 lg:right-20 top-1/2 -translate-y-1/2 flex flex-col text-right select-none pointer-events-none z-10"
        >
          <span className="text-[9px] font-bold text-[#A56A43] tracking-[0.25em] mb-1 font-mono">[02 / HORIZON]</span>
          <span className="text-lg md:text-2xl font-extrabold tracking-tight text-[#121212] uppercase leading-none font-display">LIMITLESS</span>
          <span className="text-lg md:text-2xl font-extrabold tracking-tight text-[#121212] uppercase leading-none font-display mt-1">FLEET</span>
        </motion.div>
      </div>

    </section>
  );
}
