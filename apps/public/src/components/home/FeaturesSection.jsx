import React from 'react';
import { motion } from 'motion/react';

export default function FeaturesSection({ features }) {
  return (
    <section className="py-8" style={{ background: '#F4F1EA', borderTop: '1px solid #D6D0C7', borderBottom: '1px solid #D6D0C7' }}>
      <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={`flex flex-col items-center text-center py-4 ${i > 0 ? 'lg:pl-6' : ''}`}
              style={i > 0 ? { borderLeft: 'none' } : {}}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ border: '1.5px solid #A56A43', background: 'transparent', color: '#121212' }}
              >
                {f.icon}
              </div>
              <h4 className="font-bold text-[13px] tracking-tight" style={{ color: '#121212' }}>{f.title}</h4>
              <p className="text-[11px] font-medium mt-1 leading-tight" style={{ color: '#5C5C5C' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
