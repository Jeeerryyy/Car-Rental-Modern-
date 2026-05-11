import React from 'react';
import SearchWidget from '../shared/SearchWidget';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/4 h-full bg-off/50 -skew-x-12 transform translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          
          <div className="lg:w-5/12">
            <div className="inline-block px-3 py-1 bg-dark text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-6">
              Established 2017
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-dark mb-6 leading-[1.1]">
              About Modern Selfdrive
            </h2>
            <div className="space-y-6 text-muted text-lg leading-relaxed">
              <p>
                Modern Selfdrive is Junagadh's most trusted vehicle rental platform. We offer a seamless experience for those looking to explore the Saurashtra region at their own pace.
              </p>
              <p>
                From Aadhaar-verified self-drive cars to professional chauffeur services, our mission is to provide reliable, high-quality transportation for every need—be it a trip to Gir National Park or a quick city commute.
              </p>
            </div>
            
            <div className="mt-12 pt-10 border-t border-border flex items-center gap-6">
              <div className="flex -space-x-4">
                {[10, 20, 30, 40].map((id) => (
                  <div key={id} className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${id}`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bold text-dark">Join 10,000+ Happy Travelers</p>
                <p className="text-sm text-muted">Verified reviews across Junagadh & Saurashtra</p>
              </div>
            </div>
          </div>

          <div className="lg:w-7/12 w-full">
            <div className="bg-white p-2 rounded-[var(--radius-xl)] shadow-2xl border border-border/50">
              <div className="bg-off p-6 md:p-10 rounded-[var(--radius-lg)]">
                <div className="mb-8">
                  <h3 className="font-display text-2xl font-bold text-dark">Find Your Perfect Vehicle</h3>
                  <p className="text-sm text-muted mt-1">Saurashtra's most reliable fleet is just a few clicks away.</p>
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
