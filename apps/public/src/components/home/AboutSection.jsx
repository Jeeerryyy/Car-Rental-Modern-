import React from 'react';
import { motion } from 'motion/react';
import SearchWidget from '../shared/SearchWidget';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 relative overflow-hidden" style={{ background: '#F4F1EA' }}>
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:w-5/12"
          >
            <div className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full mb-6"
              style={{ background: '#121212', color: '#F4F1EA' }}
            >
              Established 2017
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-6 leading-[1.1]" style={{ color: '#121212' }}>
              About Modern Selfdrive
            </h2>
            <div className="space-y-6 text-lg leading-relaxed" style={{ color: '#5C5C5C' }}>
              <p>
                Modern Selfdrive is Junagadh's most trusted vehicle rental platform. We offer a seamless experience for those looking to explore the Saurashtra region at their own pace.
              </p>
              <p>
                From Aadhaar-verified self-drive cars to professional chauffeur services, our mission is to provide reliable, high-quality transportation for every need—be it a trip to Gir National Park or a quick city commute.
              </p>
            </div>

            <div className="mt-12 pt-10 flex items-center gap-6" style={{ borderTop: '1px solid #D6D0C7' }}>
              <div className="flex -space-x-4">
                {[10, 20, 30, 40].map((id) => (
                  <div key={id} className="w-12 h-12 rounded-full overflow-hidden" style={{ border: '4px solid #F4F1EA', background: '#E7E0D4' }}>
                    <img src={`https://i.pravatar.cc/100?u=${id}`} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold" style={{ color: '#121212' }}>Join 10,000+ Happy Travelers</p>
                <p className="text-sm" style={{ color: '#5C5C5C' }}>Verified reviews across Junagadh & Saurashtra</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:w-7/12 w-full"
          >
            <div className="p-2 rounded-card" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7', boxShadow: '0 1px 3px rgba(18,18,18,0.04)' }}>
              <div className="p-6 md:p-10 rounded-card" style={{ background: '#E7E0D4' }}>
                <div className="mb-8">
                  <h3 className="font-display text-2xl font-bold" style={{ color: '#121212' }}>Find Your Perfect Vehicle</h3>
                  <p className="text-sm mt-1" style={{ color: '#5C5C5C' }}>Saurashtra's most reliable fleet is just a few clicks away.</p>
                </div>
                <SearchWidget />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
