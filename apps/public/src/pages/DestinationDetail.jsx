import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { ExploreIcon, DiamondIcon } from '../components/ui/Icons';
import { DESTINATION_DATA } from '../data/destinations';
import PartnershipPortal from '../components/destinations/PartnershipPortal';
import DestinationItinerary from '../components/destinations/DestinationItinerary';

const DestinationDetail = () => {
  const { slug } = useParams();
  const data = DESTINATION_DATA[slug] || DESTINATION_DATA['gir-national-park'];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div className="bg-off min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        <img src={data.heroImage} alt={data.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="text-accent text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <ExploreIcon className="w-5 h-5" /> Destination Guide
          </span>
          <h1 className="text-white font-display text-5xl md:text-7xl font-bold mb-4">{data.name}</h1>
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl font-medium mb-8 leading-relaxed">{data.description}</p>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-6 lg:px-10 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Itinerary, Maps & Gems */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Sightseeing Map */}
            <div className="bg-white p-2 rounded-[var(--radius-lg)] border border-border shadow-md">
              <iframe 
                src={data.mapUrl}
                className="w-full h-[400px] rounded-[var(--radius-md)] border-0"
                allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                title={`Map of ${data.name}`}
              ></iframe>
            </div>

            {/* Hidden Gems */}
            <section className="bg-white p-8 rounded-[var(--radius-lg)] border border-border shadow-sm">
              <h2 className="text-3xl font-display font-bold text-dark mb-6 flex items-center gap-3">
                <DiamondIcon className="text-accent w-10 h-10" />
                Hidden Gems
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {data.hiddenGems.map(g => (
                  <div key={g.name} className="bg-off p-6 rounded-[var(--radius-md)] border border-border">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-muted mb-2">{g.type}</div>
                    <h3 className="text-xl font-bold text-dark mb-2">{g.name}</h3>
                    <p className="text-sm text-muted">{g.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Places */}
            <section>
              <h2 className="text-3xl font-display font-bold text-dark mb-6 flex items-center gap-3">
                <ExploreIcon className="text-accent w-10 h-10" />
                Popular Sightseeing
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {data.places.map(p => (
                  <div key={p.name} className="bg-white p-6 rounded-[var(--radius-md)] border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-muted mb-2">{p.type}</div>
                    <h3 className="text-lg font-bold text-dark mb-2">{p.name}</h3>
                    <p className="text-sm text-muted">{p.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <DestinationItinerary itinerary={data.itinerary} />
          </div>

          {/* Right Column: Partnership Portal */}
          <div className="lg:col-span-1">
            <PartnershipPortal partners={data.partners} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
