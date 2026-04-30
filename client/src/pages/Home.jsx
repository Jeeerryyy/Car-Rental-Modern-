import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchWidget from '../components/ui/SearchWidget';
import CarCard from '../components/ui/CarCard';
import api from '../services/api';
import { 
  CarIcon, 
  LocationIcon, 
  CalendarIcon, 
  SearchIcon, 
  ShieldIcon, 
  PhoneIcon, 
  TagIcon, 
  PersonIcon, 
  CheckIcon, 
  CopyIcon,
  RouteIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  QuoteIcon,
  VerifiedIcon
} from '../components/ui/Icons';

const DESTINATIONS = [
  { name: 'Gir National Park', distance: '75 km' },
  { name: 'Somnath Temple',    distance: '90 km' },
  { name: 'Girnar Hills',      distance: '5 km' },
  { name: 'Junagadh City Tour',distance: '0 km' },
  { name: 'Diu',               distance: '135 km' },
  { name: 'Porbandar',         distance: '105 km' },
  { name: 'Veraval',           distance: '85 km' },
  { name: 'Dwarka',            distance: '210 km' },
  { name: 'Rajkot',            distance: '105 km' },
  { name: 'Ahmedabad',         distance: '315 km' },
];

const FEATURES = [
  { icon: <ShieldIcon className="w-5 h-5" />,    title: 'Secure Booking',          desc: 'Your data is safe with us' },
  { icon: <PhoneIcon className="w-5 h-5" />,     title: '24/7 Support',            desc: 'Available on call & WhatsApp' },
  { icon: <CarIcon className="w-5 h-5" />,       title: 'Wide Selection',          desc: 'Cars, SUVs & Bikes available' },
  { icon: <TagIcon className="w-5 h-5" />,       title: 'Best Prices',             desc: 'Competitive rates in Junagadh' },
  { icon: <PersonIcon className="w-5 h-5" />,    title: 'With or Without Driver',  desc: 'Your choice, every time' },
];

const STEPS = [
  { icon: 'location_on',    title: 'Choose Location', desc: 'Select your Junagadh pickup point and travel dates' },
  { icon: 'directions_car', title: 'Choose Vehicle',  desc: 'Browse cars, SUVs, and bikes' },
  { icon: 'credit_card',    title: 'Book & Pay',      desc: 'Confirm with UPI, card, or cash' },
  { icon: 'key',            title: 'Pick Up & Drive',  desc: 'Collect keys and hit the road' },
];

const SERVICES = [
  { emoji: '🚗', title: 'Self Drive Cars',       desc: 'Drive yourself across Gujarat. No driver needed. Just your license and Aadhaar.' },
  { emoji: '👨‍✈️', title: 'With Driver Service',   desc: 'Sit back and relax. Our experienced drivers know every road in Saurashtra.' },
  { emoji: '🛫', title: 'Airport Pickup & Drop', desc: 'Timely transfers from Keshod & Junagadh airports. Available 24/7.' },
  { emoji: '🏍', title: 'Bike & Scooter Rental', desc: 'Explore Junagadh and Gir on two wheels. Activa, RE, and more available.' },
  { emoji: '🏨', title: 'Hotel & Resort Tie-ups', desc: 'Get exclusive discounts and VIP treatment at our partner hotels and resorts near major destinations.' },
  { emoji: '🗺️', title: 'Curated Itineraries', desc: 'Not sure where to go? Follow our expert-crafted travel itineraries for Gir, Somnath, and Diu.' },
];

const FALLBACK_REVIEWS = [
  { _id: '1', name: 'Nishant Sinojia', rating: 5, text: 'We hired self driving car for 7 days, process is much easy and smoother than other vendors. Car condition was good. Price is reasonable. Must recommend if you are looking for self drive option.', vehicle: '7 Days Rental', verified: true, avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
  { _id: '2', name: 'Nirav Shah', rating: 5, text: 'Extra ordinary service. We took a self-drive car (Fronx) from junagadh and had a trip to Gir - Somnath- Dwarka. Car was in excellent condition and we didn\'t face any issues.', vehicle: 'Suzuki Fronx', verified: true, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
  { _id: '3', name: 'Hemang Mehta', rating: 5, text: 'I recently rented a car from Modern Self Drive in Junagadh and had an awesome experience! They have a fleet of brand-new, well-maintained cars. A special thanks to Wasim bhai, the owner.', vehicle: 'Self Drive', verified: true, avatar: 'https://images.pexels.com/photos/2100063/pexels-photo-2100063.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
  { _id: '4', name: 'Parth Racka', rating: 5, text: 'Best Car Service ever. The support is awesome. Highly trustable and professional behavior.', vehicle: 'Premium Service', verified: true, avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
  { _id: '5', name: 'Ravi Bagthariya', rating: 5, text: 'Good service and car quality very nice. One of the most reliable options in Junagadh region.', vehicle: 'Hatchback', verified: true, avatar: 'https://images.pexels.com/photos/775358/pexels-photo-775358.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
];

function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState('gir-national-park');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('MODERN20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    let cancelled = false;
    api.get('/api/cars?isPopular=true&limit=3')
      .then(async (res) => {
        if (cancelled) return;
        let list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        
        // Fallback: if no popular cars, just get any 3 cars
        if (list.length === 0) {
          const fallbackRes = await api.get('/api/cars?limit=3');
          list = Array.isArray(fallbackRes.data) ? fallbackRes.data : (fallbackRes.data?.data ?? []);
        }
        
        setCars(list);
      })
      .catch(() => { if (!cancelled) setCars([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    api.get('/api/reviews/featured')
      .then((res) => {
        if (cancelled) return;
        const list = res.data?.data ?? [];
        setReviews(list.length > 0 ? list : FALLBACK_REVIEWS);
      })
      .catch(() => { if (!cancelled) setReviews(FALLBACK_REVIEWS); })
      .finally(() => { if (!cancelled) setReviewsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return (
    <main id="main-content" className="bg-off overflow-x-hidden">

      {/* ── hero ─────────────────────────────────────────── */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 bg-gradient-to-br from-[#f8f6f0] to-[#e8e4d9] overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-center relative z-10">
          <div className="lg:w-1/2 max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-[72px] leading-[1.1] font-extrabold text-dark tracking-[-1px] mb-6 whitespace-pre-line">
              {'Drive Your Journey.\nYour Way.'}
            </h1>
            <p className="text-lg text-muted mb-10 max-w-lg leading-relaxed">
              Junagadh's most trusted self drive car rental since 2017. Cars with & without driver. Airport pickup. Bike rentals.
            </p>
            <div className="flex flex-wrap gap-6 items-center">
              <Link to="/cars" className="btn-primary w-full sm:w-auto justify-center">Browse Fleet</Link>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-3">
                  {['bg-gray-300', 'bg-gray-400', 'bg-gray-500'].map((bg) => (
                    <div key={bg} className={`w-10 h-10 rounded-full border-2 border-[#f8f6f0] ${bg}`} />
                  ))}
                </div>
                <div className="text-sm font-semibold text-dark ml-2">
                  5.0★ <span className="font-normal text-muted block text-xs">500+ Fleet | 8+ Years</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 relative mt-16 lg:mt-0">
            <img
              src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=900&q=80"
              alt="Premium self drive rental car from Modern Selfdrive"
              fetchPriority="high"
              width="900" height="600"
              className="w-full h-auto drop-shadow-2xl z-10 relative object-contain"
            />
            <div className="absolute top-10 right-10 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-[var(--radius-md)] shadow-lg z-20">
              <p className="font-bold text-dark text-xl">5.0 ⭐</p>
              <p className="text-xs text-muted uppercase tracking-wider font-semibold">400+ Verified Reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── about & search (polished) ───────────────────── */}
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

      {/* ── destinations marquee ──────────────────────────── */}
      <section className="py-6 border-y border-border bg-white overflow-hidden">
        <div className="relative w-full flex items-center">
          <div className="flex gap-4 w-max animate-marquee text-dark text-lg font-bold">
            {[0, 1].flatMap((set) =>
              DESTINATIONS.map((d, i) => (
                <div key={`${set}-${i}`} className="flex items-center gap-4">
                  <span className="whitespace-nowrap">
                    {d.name} <span className="text-muted font-medium text-sm">({d.distance})</span>
                  </span>
                  <span className="text-border mx-2 text-sm">•</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── popular fleet ────────────────────────────────── */}
      <section className="py-24 max-w-[1320px] mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
               <span className="text-[10px] font-bold uppercase tracking-[2px] text-muted">Handpicked Selection</span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-dark mb-4">Popular Fleet</h2>
            <p className="text-muted text-lg leading-relaxed">Our most requested vehicles for business and leisure. Every car is sanitized and maintained to the highest standards.</p>
          </div>
          <Link to="/cars" className="btn-outline group whitespace-nowrap">
            View All Fleet
            <ArrowRightIcon className="ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)
            : cars.length > 0
              ? cars.slice(0, 3).map((c) => (
                  <CarCard
                    key={c._id} id={c._id}
                    name={`${c.make} ${c.model}`}
                    image={c.images?.[0]}
                    price={c.pricePerDay}
                    seats={c.seats}
                    transmission={c.transmission}
                    category={c.category}
                    fuelType={c.fuelType}
                    driveOption={c.driveOption}
                  />
                ))
              : (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-off/50 rounded-[var(--radius-md)] border border-dashed border-border flex flex-col items-center justify-center">
                  <CarIcon className="w-12 h-12 text-muted/20 mb-4" />
                  <p className="text-muted mb-6 font-medium">Unable to load featured fleet right now.</p>
                  <Link to="/cars" className="btn-outline !bg-white">Browse Full Fleet</Link>
                </div>
              )
          }

          {/* promo card */}
          {/* promo card (polished) */}
          <div className="bg-dark rounded-[var(--radius-lg)] p-10 text-white flex flex-col justify-center items-center text-center relative overflow-hidden group shadow-xl h-full min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark/95 to-dark/40 z-10" />
            <img
              src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80"
              className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale"
              alt="" loading="lazy" aria-hidden="true"
            />
            <div className="relative z-20 w-full flex flex-col items-center">
              <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-[2px] mb-6 inline-block border border-white/20">Limited Offer</span>
              <h3 className="font-display text-3xl font-bold mb-4 leading-tight">
                Get <span className="text-accent text-4xl">20%</span> Off<br/>Your First Booking
              </h3>
              
              <div className="flex flex-col items-center gap-2 mb-8 w-full">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Use Promo Code</p>
                <button 
                  onClick={handleCopyCode}
                  className="relative w-full py-3 border border-dashed border-white/30 rounded-sm bg-white/5 font-mono text-white text-xl font-bold tracking-widest group/copy cursor-pointer hover:bg-white/10 transition-colors"
                  title="Click to copy code"
                >
                  MODERN20
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 group-hover/copy:opacity-100 transition-opacity">
                    {copied ? <CheckIcon className="w-4 h-4 text-accent" /> : <CopyIcon className="w-4 h-4 text-white/40" />}
                  </span>
                  {copied && (
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-dark text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                      CODE COPIED!
                    </span>
                  )}
                </button>
              </div>
              
              <Link to="/cars" className="btn-primary !bg-white !text-dark w-full justify-center shadow-lg">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── features ─────────────────────────────────────── */}
      <section className="bg-white py-8 border-y border-border">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className={`flex flex-col items-center text-center ${i > 0 ? 'lg:border-l lg:border-border lg:pl-6' : ''}`}>
                <div className="w-12 h-12 rounded-full bg-off flex items-center justify-center text-dark mb-3 border border-border">
                  {f.icon}
                </div>
                <h4 className="font-bold text-dark text-sm">{f.title}</h4>
                <p className="text-xs text-muted mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── travel hub (minimal ecosystem) ───────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-dark mb-4">Your Travel Hub</h2>
            <p className="text-muted text-lg max-w-xl mx-auto">Everything you need for your Saurashtra journey in one seamless platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Rent a Vehicle */}
            <div className="bg-white p-10 rounded-[var(--radius-md)] border border-border shadow-sm flex flex-col justify-between">
              <div>
                <CarIcon className="w-10 h-10 text-accent mb-6" />
                <h3 className="font-display text-2xl font-bold text-dark mb-3">Rent a Vehicle</h3>
                <p className="text-muted text-sm mb-8 leading-relaxed">Aadhaar-verified self-drive cars, chauffeur services, or 24/7 airport transfers.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                <Link to="/cars" className="btn-primary flex items-center justify-center text-sm py-3 px-2">Self-Drive</Link>
                <Link to="/cars" className="btn-outline flex items-center justify-center text-sm py-3 px-2 bg-off">With Driver</Link>
              </div>
            </div>

            {/* Plan a Trip */}
            <div className="bg-white p-10 rounded-[var(--radius-md)] border border-border shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <SearchIcon className="w-10 h-10 text-accent mb-6" />
                <h3 className="font-display text-2xl font-bold text-dark mb-3">Plan a Trip</h3>
                <p className="text-muted text-sm mb-8 leading-relaxed">Select a destination to view curated itineraries, hidden gems, and book partner hotels & dining.</p>
              </div>
              
              <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 mt-auto">
                <div className="relative w-full">
                  <LocationIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5 pointer-events-none" />
                  <select 
                    className="w-full bg-off text-dark border border-border py-3 pl-12 pr-10 rounded-sm appearance-none focus:outline-none focus:border-accent cursor-pointer transition-colors text-sm"
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                  >
                    <option value="gir-national-park">Gir National Park</option>
                    <option value="somnath-temple">Somnath Temple</option>
                    <option value="diu">Diu Island</option>
                    <option value="dwarka">Dwarka</option>
                    <option value="rajkot">Rajkot City</option>
                    <option value="porbandar">Porbandar</option>
                    <option value="rann-of-kutch">Rann of Kutch</option>
                  </select>

                </div>
                <Link to={`/destinations/${selectedDestination}`} className="btn-primary flex items-center justify-center text-sm py-3 px-6 shadow-sm whitespace-nowrap mt-4 sm:mt-0">
                  Plan Trip
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── reviews ──────────────────────────────────────── */}
      <section className="py-24 bg-off overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10 mb-12">
          <h2 className="font-display text-4xl font-bold text-dark mb-4 text-center">What Our Clients Say</h2>
          <p className="text-muted text-center max-w-xl mx-auto">Real reviews from verified customers across Junagadh and Saurashtra region.</p>
        </div>
        
        <div className="relative w-full overflow-hidden">
          {reviewsLoading ? (
            <div className="flex gap-6 justify-center px-6">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="w-[350px] flex-shrink-0">
                  <ReviewSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-6 w-max animate-marquee">
              {[0, 1].flatMap((set) =>
                reviews.map((r, i) => (
                  <a href="https://g.page/modern-selfdrive" target="_blank" rel="noopener noreferrer" key={`${set}-${r._id || i}`} className="w-[350px] flex-shrink-0 block group cursor-pointer">
                    <ReviewCard review={r} />
                  </a>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/* ── skeleton for car cards ──────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="bg-white rounded-[var(--radius-md)] overflow-hidden shadow-sm border border-border">
      <div className="h-[220px] skeleton" />
      <div className="p-6 space-y-3">
        <div className="h-5 skeleton w-3/4" />
        <div className="h-4 skeleton w-1/2" />
        <div className="h-8 skeleton w-1/3 mt-4" />
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  const { name, rating, text, vehicle, tripType, verified } = review;
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-600', 'bg-rose-600', 'bg-cyan-600'];
  const avatarColor = colors[name.charCodeAt(0) % colors.length];

  return (
    <div className="bg-white p-8 rounded-[var(--radius-md)] border border-border shadow-sm relative flex flex-col h-[320px]">
      <QuoteIcon className="text-yellow-400 w-12 h-12 absolute top-6 right-6 opacity-20" />

      <div className="flex text-yellow-400 mb-4 text-lg tracking-wide">{stars}</div>

      <p className="text-muted italic mb-6 leading-relaxed flex-1 overflow-hidden text-ellipsis line-clamp-4">"{text}"</p>

      {(vehicle || tripType) && (
        <div className="flex flex-wrap gap-2 mb-5">
          {vehicle && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-off text-dark px-2.5 py-1 rounded-full border border-border">
              <CarIcon className="w-3.5 h-3.5" />
              {vehicle}
            </span>
          )}
          {tripType && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-off text-dark px-2.5 py-1 rounded-full border border-border">
              <RouteIcon className="w-3.5 h-3.5" />
              {tripType}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-5 border-t border-border">
        <div className="flex items-center gap-3">
          {review.avatar ? (
            <div className="w-9 h-9 rounded-full overflow-hidden border border-border shadow-sm">
              <img src={review.avatar} alt={name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
              {initials}
            </div>
          )}
          <span className="font-bold text-dark text-sm">{name}</span>
        </div>
        {verified && (
          <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-800 px-2 py-1 rounded font-bold uppercase tracking-wider">
            <VerifiedIcon className="w-3 h-3" />
            Verified
          </span>
        )}
      </div>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="bg-white p-8 rounded-[var(--radius-md)] border border-border shadow-sm">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }, (_, i) => <div key={i} className="w-5 h-5 skeleton rounded" />)}
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-4 skeleton w-full" />
        <div className="h-4 skeleton w-5/6" />
        <div className="h-4 skeleton w-3/4" />
      </div>
      <div className="flex gap-2 mb-5">
        <div className="h-6 skeleton w-24 rounded-full" />
        <div className="h-6 skeleton w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-3 pt-5 border-t border-border">
        <div className="w-9 h-9 skeleton rounded-full" />
        <div className="h-4 skeleton w-24" />
      </div>
    </div>
  );
}

export default Home;
