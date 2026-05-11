import React from 'react';

export default function FeaturesSection({ features }) {
  return (
    <section className="bg-white py-8 border-y border-border">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {features.map((f, i) => (
            <div key={i} className={`flex flex-col items-center text-center py-4 ${i > 0 ? 'lg:border-l lg:border-border lg:pl-6' : ''}`}>
              <div className="w-14 h-14 rounded-full bg-dark flex items-center justify-center mb-4 shadow-lg shadow-dark/10 transition-transform hover:-translate-y-1 duration-300">
                {f.icon}
              </div>
              <h4 className="font-bold text-dark text-[13px] tracking-tight">{f.title}</h4>
              <p className="text-[11px] text-muted font-medium mt-1 leading-tight">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
