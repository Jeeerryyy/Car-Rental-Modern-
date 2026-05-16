import React from 'react';

export default function FeaturesSection({ features }) {
  return (
    <section className="py-8" style={{ background: '#F9F8F3', borderTop: '1px solid rgba(182,124,61,0.15)', borderBottom: '1px solid rgba(182,124,61,0.15)' }}>
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {features.map((f, i) => (
            <div key={i} className={`flex flex-col items-center text-center py-4 ${i > 0 ? 'lg:pl-6' : ''}`}
              style={i > 0 ? { borderLeft: 'none' } : {}}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ border: '1.5px solid #B67C3D', background: 'transparent', color: '#19130E' }}
              >
                {f.icon}
              </div>
              <h4 className="font-bold text-[13px] tracking-tight" style={{ color: '#19130E' }}>{f.title}</h4>
              <p className="text-[11px] font-medium mt-1 leading-tight" style={{ color: '#6b5e50' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
