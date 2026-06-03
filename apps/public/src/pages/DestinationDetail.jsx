import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { ExploreIcon, DiamondIcon } from '../components/ui/Icons';
import { DESTINATION_DATA } from '../data/destinations';
import PartnershipPortal from '../components/destinations/PartnershipPortal';
import DestinationItinerary from '../components/destinations/DestinationItinerary';

const DestinationDetail = () => {
  const { slug } = useParams();
  const data = DESTINATION_DATA[slug] || DESTINATION_DATA['gir-national-park'];

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F4F1EA' }}>
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        <img src={data.heroImage} alt={data.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'rgba(18,18,18,0.6)' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: '#A56A43' }}>
            <ExploreIcon className="w-5 h-5" /> Destination Guide
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-4" style={{ color: '#F4F1EA' }}>{data.name}</h1>
          <p className="text-lg md:text-xl max-w-2xl font-medium mb-8 leading-relaxed" style={{ color: 'rgba(214,208,199,0.8)' }}>{data.description}</p>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            {/* Sightseeing Map */}
            <div className="p-2 rounded-[12px]" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
              <iframe src={data.mapUrl} className="w-full h-[400px] rounded-[8px] border-0"
                allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Map of ${data.name}`}></iframe>
            </div>

            {/* Hidden Gems */}
            <section className="p-8 rounded-[12px]" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
              <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3" style={{ color: '#121212' }}>
                <DiamondIcon className="w-10 h-10" style={{ color: '#A56A43' }} />
                Hidden Gems
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {data.hiddenGems.map(g => (
                  <div key={g.name} className="p-6 rounded-[8px]" style={{ background: '#E7E0D4', border: '1px solid rgba(182,124,61,0.1)' }}>
                    <div className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color: '#5C5C5C' }}>{g.type}</div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: '#121212' }}>{g.name}</h3>
                    <p className="text-sm" style={{ color: '#5C5C5C' }}>{g.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Places */}
            <section>
              <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3" style={{ color: '#121212' }}>
                <ExploreIcon className="w-10 h-10" style={{ color: '#A56A43' }} />
                Popular Sightseeing
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {data.places.map(p => (
                  <div key={p.name} className="p-6 rounded-[12px]" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
                    <div className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color: '#5C5C5C' }}>{p.type}</div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#121212' }}>{p.name}</h3>
                    <p className="text-sm" style={{ color: '#5C5C5C' }}>{p.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <DestinationItinerary itinerary={data.itinerary} />
          </div>

          <div className="lg:col-span-1">
            <PartnershipPortal partners={data.partners} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
