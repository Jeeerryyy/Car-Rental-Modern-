import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  ExploreIcon, 
  DiamondIcon, 
  MapIcon, 
  HandshakeIcon, 
  StarIcon, 
  OfferIcon, 
  RestaurantIcon, 
  CarIcon 
} from '../components/ui/Icons';

// Static Data for demonstration (In production, this comes from DB)
const DESTINATION_DATA = {
  'gir-national-park': {
    name: 'Gir National Park',
    heroImage: 'https://images.unsplash.com/photo-1581896798020-f421f2bbcb2a?auto=format&fit=crop&w=1200&q=80',
    description: 'The only natural habitat of the world popular Asiatic Lions. Enjoy thrilling wildlife safaris.',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118949.11762111812!2d70.7206456073801!3d21.164344588506507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3958ee66d34b22c7%3A0xe54508ecf6d90060!2sGir%20National%20Park!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    places: [
      { name: 'Devalia Safari Park', type: 'Wildlife', desc: 'A fenced area offering a high chance to spot lions in a shorter time.' },
      { name: 'Kamleshwar Dam', type: 'Scenic Point', desc: 'A beautiful dam inside the sanctuary, home to many crocodiles.' },
      { name: 'Tulsi Shyam Springs', type: 'Hot Springs', desc: 'Natural hot water springs with mythological significance.' }
    ],
    hiddenGems: [
      { name: 'Jamjir Waterfall', type: 'Nature', desc: 'A spectacular hidden waterfall surrounded by dense forest, 40km from the park core.' },
      { name: 'Shirvan Village', type: 'Culture', desc: 'A remote settlement offering insights into the Siddi community living in Gujarat.' }
    ],
    itinerary: [
      { day: 'Day 1', title: 'Arrival & Jungle Safari', details: 'Arrive in the morning, check-in to your resort. Take the afternoon open-jeep safari. Evening cultural program at the resort.' },
      { day: 'Day 2', title: 'Devalia & Departure', details: 'Morning visit to Devalia Safari Park. Check-out and head back.' }
    ],
    partners: {
      hotels: [
        { name: 'Gir Jungle Lodge', perk: '15% Off with Modern Selfdrive', rating: 4.5, roomsLeft: 2, price: '₹4,500' },
        { name: 'The Fern Gir Forest Resort', perk: 'Free Safari Assistance', rating: 4.8, roomsLeft: 1, price: '₹8,200' }
      ],
      dining: [
        { name: 'Terracotta Restaurant', cuisine: 'Gujarati Thali', perk: 'Free Welcome Drink', rating: 4.4 },
        { name: 'Lion\'s Den Cafe', cuisine: 'Multi-cuisine', perk: '10% Discount on Bill', rating: 4.1 }
      ]
    }
  },
  'somnath-temple': {
    name: 'Somnath Temple',
    heroImage: 'https://images.unsplash.com/photo-1623864756531-df621a6ab430?auto=format&fit=crop&w=1200&q=80',
    description: 'First among the twelve Aadi Jyotirlings of India. A magnificent temple with beautiful ocean views.',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.326842065538!2d70.39869507567794!3d20.899144880718536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba32d0c2ee4cd17%3A0xcabfdbd422ec2af8!2sSomnath%20Temple!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    places: [
      { name: 'Bhalka Tirtha', type: 'Pilgrimage', desc: 'The site where Lord Krishna is believed to have been hit by an arrow.' },
      { name: 'Somnath Beach', type: 'Relaxation', desc: 'A serene beach to watch the sunset.' },
      { name: 'Triveni Sangam', type: 'Holy site', desc: 'Confluence of three rivers: Hiran, Kapila, and Saraswati.' }
    ],
    hiddenGems: [
      { name: 'Prabhas Patan Museum', type: 'History', desc: 'Houses remnants of the ancient Somnath temple ruins and ancient stone inscriptions.' },
      { name: 'Bakhalka Caves', type: 'Ancient', desc: 'Lesser-known rock-cut caves offering a quiet retreat from the temple crowds.' }
    ],
    itinerary: [
      { day: 'Day 1', title: 'Temple Visit & Light Show', details: 'Reach by afternoon. Visit the main temple for evening Aarti. Do not miss the spectacular Light and Sound show at 8 PM.' },
      { day: 'Day 2', title: 'Local Sightseeing', details: 'Visit Bhalka Tirtha and Triveni Sangam before departing.' }
    ],
    partners: {
      hotels: [
        { name: 'Lords Inn Somnath', perk: '10% Flat Discount', rating: 4.2, roomsLeft: 4, price: '₹3,200' },
        { name: 'The Fern Residency', perk: 'Complimentary Dinner', rating: 4.4, roomsLeft: 3, price: '₹5,500' }
      ],
      dining: [
        { name: 'Sugar N Spice', cuisine: 'Punjabi & Chinese', perk: 'Free Dessert', rating: 4.3 },
        { name: 'Bhai Bhai Dabeli', cuisine: 'Street Food', perk: 'VIP Service', rating: 4.6 }
      ]
    }
  },
  'diu': {
    name: 'Diu',
    heroImage: 'https://images.unsplash.com/photo-1616428751557-0b16f3900d72?auto=format&fit=crop&w=1200&q=80',
    description: 'A beautiful island offering a blend of Portuguese history and serene beaches.',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60064.29314995293!2d70.92341995820313!3d20.720231500000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be31ce46da7863f%3A0xc0fb1d60cebc2dd8!2sDiu%2C%20Dadra%20and%20Nagar%20Haveli%20and%20Daman%20and%20Diu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    places: [
      { name: 'Nagoa Beach', type: 'Beach', desc: 'Popular horseshoe-shaped beach with water sports.' },
      { name: 'Diu Fort', type: 'Historical', desc: 'A magnificent Portuguese fort offering panoramic ocean views.' },
      { name: 'Naida Caves', type: 'Exploration', desc: 'A network of man-made caves with natural sunlight seeping through.' }
    ],
    hiddenGems: [
      { name: 'Ghoghla Beach', type: 'Beach', desc: 'A Blue-Flag certified beach, much cleaner and less crowded than Nagoa.' },
      { name: 'St. Paul\'s Church', type: 'Architecture', desc: 'An exquisite piece of Portuguese baroque architecture.' }
    ],
    itinerary: [
      { day: 'Day 1', title: 'Forts & Sunsets', details: 'Visit Diu Fort in the morning. Explore Naida caves before lunch. Spend the evening relaxing at Jallandhar Beach.' },
      { day: 'Day 2', title: 'Water Sports', details: 'Head to Nagoa beach for parasailing and banana boat rides. Return in the evening.' }
    ],
    partners: {
      hotels: [
        { name: 'Radhika Beach Resort', perk: 'Free Welcome Drinks', rating: 4.6, roomsLeft: 1, price: '₹7,500' },
        { name: 'Kostamar Beach Resort', perk: 'Late Checkout', rating: 4.3, roomsLeft: 5, price: '₹6,000' }
      ],
      dining: [
        { name: 'O\'Coqueiro Music Garden', cuisine: 'Seafood & Goan', perk: '15% Off Total Bill', rating: 4.5 },
        { name: 'Night Heron', cuisine: 'Continental', perk: 'Free Mocktails', rating: 4.2 }
      ]
    }
  }
};

const DestinationDetail = () => {
  const { slug } = useParams();
  const data = DESTINATION_DATA[slug] || DESTINATION_DATA['gir-national-park'];
  const [activeTab, setActiveTab] = useState('hotels');

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

            {/* Hidden Gems (New) */}
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

            {/* Itinerary */}
            <section>
              <h2 className="text-3xl font-display font-bold text-dark mb-8 flex items-center gap-3">
                <MapIcon className="text-accent w-10 h-10" />
                Curated Itinerary
              </h2>
              <div className="space-y-6">
                {data.itinerary.map((day, idx) => (
                  <div key={day.day} className="flex gap-6 relative">
                    {idx !== data.itinerary.length - 1 && <div className="absolute left-6 top-12 bottom-0 w-px bg-border -z-10" />}
                    <div className="w-12 h-12 flex-shrink-0 bg-dark text-white rounded-full flex items-center justify-center font-bold font-display shadow-md border-4 border-off">
                      {idx + 1}
                    </div>
                    <div className="bg-white p-6 rounded-[var(--radius-md)] border border-border shadow-sm flex-1">
                      <h3 className="text-lg font-bold text-dark mb-1">{day.day}: {day.title}</h3>
                      <p className="text-sm text-muted leading-relaxed">{day.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Partnership Portal */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[var(--radius-lg)] border border-border shadow-lg sticky top-[100px] overflow-hidden">
              <div className="bg-dark text-white p-6">
                <h2 className="text-xl font-display font-bold mb-2 flex items-center gap-2">
                  <HandshakeIcon className="text-accent w-6 h-6" />
                  Partnership Portal
                </h2>
                <p className="text-xs text-gray-400">Exclusive tie-ups & real-time booking availability for Modern Selfdrive customers.</p>
              </div>
              
              <div className="flex border-b border-border bg-off">
                <button 
                  onClick={() => setActiveTab('hotels')}
                  className={`flex-1 py-3 text-sm font-bold text-center ${activeTab === 'hotels' ? 'bg-white text-dark border-b-2 border-dark' : 'text-muted'}`}
                >
                  Boutique Hotels
                </button>
                <button 
                  onClick={() => setActiveTab('dining')}
                  className={`flex-1 py-3 text-sm font-bold text-center ${activeTab === 'dining' ? 'bg-white text-dark border-b-2 border-dark' : 'text-muted'}`}
                >
                  Local Dining
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'hotels' ? (
                  <div className="space-y-6">
                    {data.partners.hotels.map(h => (
                      <div key={h.name} className="border border-border rounded-md p-4 bg-white hover:border-dark transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-dark text-sm">{h.name}</h3>
                          <div className="flex items-center text-xs font-bold text-dark bg-off px-1.5 py-0.5 rounded">
                            <StarIcon className="w-3.5 h-3.5 text-yellow-500 mr-1" fill="currentColor" />
                            {h.rating}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded animate-pulse">
                            Only {h.roomsLeft} left
                          </span>
                          <span className="font-bold text-dark text-sm">{h.price} <span className="text-xs text-muted font-normal">/night</span></span>
                        </div>
                        <div className="flex items-start gap-1.5 bg-green-50 text-green-800 p-2 rounded text-xs font-medium mb-3">
                          <OfferIcon className="w-4 h-4" />
                          {h.perk}
                        </div>
                        <button className="w-full bg-dark text-white text-xs font-bold py-2 rounded transition-colors hover:opacity-90">
                          Book via Partner
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {data.partners.dining.map(d => (
                      <div key={d.name} className="border border-border rounded-md p-4 bg-white hover:border-dark transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-dark text-sm">{d.name}</h3>
                          <div className="flex items-center text-xs font-bold text-dark bg-off px-1.5 py-0.5 rounded">
                            <StarIcon className="w-3.5 h-3.5 text-yellow-500 mr-1" fill="currentColor" />
                            {d.rating}
                          </div>
                        </div>
                        <p className="text-xs text-muted mb-3">{d.cuisine}</p>
                        <div className="flex items-start gap-1.5 bg-green-50 text-green-800 p-2 rounded text-xs font-medium mb-3">
                          <RestaurantIcon className="w-4 h-4" />
                          {d.perk}
                        </div>
                        <button className="w-full border border-dark text-dark text-xs font-bold py-2 rounded transition-colors hover:bg-dark hover:text-white">
                          Reserve Table
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-off p-6 border-t border-border">
                <h3 className="font-bold text-dark mb-2 text-sm flex items-center gap-2">
                  <CarIcon className="w-5 h-5" />
                  Need transport?
                </h3>
                <p className="text-xs text-muted mb-4 leading-relaxed">Book a premium self-drive vehicle or chauffeur service to easily access these partnered locations.</p>
                <Link to="/cars" className="btn-primary w-full justify-center text-sm py-2.5">Explore Fleet</Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
