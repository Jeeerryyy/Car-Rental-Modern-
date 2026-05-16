import React from 'react';
import SearchWidget from '../shared/SearchWidget';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 relative overflow-hidden" style={{ background: '#F9F8F3' }}>
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

          <div className="lg:w-5/12">
            <div className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full mb-6"
              style={{ background: '#19130E', color: '#F9F8F3' }}
            >
              Established 2017
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-6 leading-[1.1]" style={{ color: '#19130E' }}>
              About Modern Selfdrive
            </h2>
            <div className="space-y-6 text-lg leading-relaxed" style={{ color: '#6b5e50' }}>
              <p>
                Modern Selfdrive is Junagadh's most trusted vehicle rental platform. We offer a seamless experience for those looking to explore the Saurashtra region at their own pace.
              </p>
              <p>
                From Aadhaar-verified self-drive cars to professional chauffeur services, our mission is to provide reliable, high-quality transportation for every need—be it a trip to Gir National Park or a quick city commute.
              </p>
            </div>

            <div className="mt-12 pt-10 flex items-center gap-6" style={{ borderTop: '1px solid rgba(182,124,61,0.15)' }}>
              <div className="flex -space-x-4">
                {[10, 20, 30, 40].map((id) => (
                  <div key={id} className="w-12 h-12 rounded-full overflow-hidden" style={{ border: '4px solid #F9F8F3', background: '#EBE6DE' }}>
                    <img src={`https://i.pravatar.cc/100?u=${id}`} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold" style={{ color: '#19130E' }}>Join 10,000+ Happy Travelers</p>
                <p className="text-sm" style={{ color: '#6b5e50' }}>Verified reviews across Junagadh & Saurashtra</p>
              </div>
            </div>
          </div>

          <div className="lg:w-7/12 w-full">
            <div className="p-2 rounded-[12px]" style={{ background: '#F2EEE5', border: '1px solid rgba(182,124,61,0.15)', boxShadow: '0 1px 3px rgba(25,19,14,0.06)' }}>
              <div className="p-6 md:p-10 rounded-[8px]" style={{ background: '#EBE6DE' }}>
                <div className="mb-8">
                  <h3 className="font-display text-2xl font-bold" style={{ color: '#19130E' }}>Find Your Perfect Vehicle</h3>
                  <p className="text-sm mt-1" style={{ color: '#6b5e50' }}>Saurashtra's most reliable fleet is just a few clicks away.</p>
                </div>
                <SearchWidget />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
