import { useState, useEffect } from 'react';

export default function VehicleHero({ car, heroImages }) {
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setImgIdx(i => (i + 1) % heroImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  return (
    <div className="relative h-[clamp(260px,40vw,480px)] overflow-hidden bg-[#111]">
      <img
        key={imgIdx}
        src={heroImages[imgIdx]}
        alt={`${car.make} ${car.model}`}
        className="w-full h-full object-cover opacity-70 block"
        style={{ animation: 'imgFade 0.5s ease-in-out' }}
      />

      {heroImages.length > 1 && (
        <>
          <div className="absolute top-1/2 w-full flex justify-between px-5" style={{ transform: 'translateY(-50%)', zIndex: 2 }}>
            <button className="w-10 h-10 bg-black/50 border border-white/10 text-white text-xl flex items-center justify-center cursor-pointer transition-all hover:bg-[#C89B5B] hover:text-black hover:border-[#C89B5B]"
              onClick={() => setImgIdx(i => (i - 1 + heroImages.length) % heroImages.length)}>
              ‹
            </button>
            <button className="w-10 h-10 bg-black/50 border border-white/10 text-white text-xl flex items-center justify-center cursor-pointer transition-all hover:bg-[#C89B5B] hover:text-black hover:border-[#C89B5B]"
              onClick={() => setImgIdx(i => (i + 1) % heroImages.length)}>
              ›
            </button>
          </div>
          <div className="absolute bottom-5 left-1/2 flex gap-2" style={{ transform: 'translateX(-50%)', zIndex: 2 }}>
            {heroImages.map((_, i) => (
              <div key={i}
                className={`w-11 h-[3px] cursor-pointer transition-all ${i === imgIdx ? 'bg-[#C89B5B]' : 'bg-white/20'}`}
                onClick={() => setImgIdx(i)} />
            ))}
          </div>
        </>
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute top-5 left-6 bg-[#C89B5B] text-[#111] font-headline-lg text-[13px] tracking-wide px-3 py-1 z-10">
        {car.type === 'bike' ? '🏍 Bike' : '🚗 Car'} · {car.category}
      </div>
      <div className="absolute bottom-7 left-7 z-10">
        <div className="font-headline-xl text-white leading-none" style={{ fontSize: 'clamp(36px,6vw,72px)' }}>
          {car.make}<br />{car.model}
        </div>
        <div className="text-white/50 text-[13px] font-semibold tracking-wide mt-2">
          {car.year} · ₹{car.pricePerDay?.toLocaleString()} / Day
        </div>
      </div>
    </div>
  );
}