import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchWidget from '../components/ui/SearchWidget';
import CarCard from '../components/ui/CarCard';
import api from '../services/api';

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
  { icon: 'shield_lock',    title: 'Secure Booking',          desc: 'Your data is safe with us' },
  { icon: 'support_agent',  title: '24/7 Support',            desc: 'Available on call & WhatsApp' },
  { icon: 'directions_car', title: 'Wide Selection',          desc: 'Cars, SUVs & Bikes available' },
  { icon: 'sell',           title: 'Best Prices',             desc: 'Competitive rates in Junagadh' },
  { icon: 'person',         title: 'With or Without Driver',  desc: 'Your choice, every time' },
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
];

const FALLBACK_REVIEWS = [
  { _id: '1', text: 'Best self drive experience in Junagadh. Car was spotless and owner very helpful.', name: 'Rahul M.', rating: 5, verified: true, vehicle: 'Hyundai Creta' },
  { _id: '2', text: 'Took Thar for Gir trip, amazing condition and very reasonable rates. Highly recommended!', name: 'Priya S.', rating: 5, verified: true, vehicle: 'Mahindra Thar' },
  { _id: '3', text: 'Airport drop was on time and driver was professional. Will book again.', name: 'Amit K.', rating: 5, verified: true, vehicle: 'Maruti Dzire' },
];

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/api/cars?limit=3')
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setCars(list.slice(0, 3));
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
    <main id="main-content" className="bg-off">

      {/* ── hero ─────────────────────────────────────────── */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 bg-gradient-to-br from-[#f8f6f0] to-[#e8e4d9] overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-center relative z-10">
          <div className="lg:w-1/2 max-w-2xl">
            <h1 className="font-display text-5xl lg:text-[72px] leading-[1.1] font-extrabold text-dark tracking-[-1px] mb-6 whitespace-pre-line">
              {'Drive Your Journey.\nYour Way.'}
            </h1>
            <p className="text-lg text-muted mb-10 max-w-lg leading-relaxed">
              Junagadh's most trusted self drive car rental since 2017. Cars with & without driver. Airport pickup. Bike rentals.
            </p>
            <div className="flex flex-wrap gap-6 items-center">
              <Link to="/cars" className="btn-primary">Browse Fleet</Link>
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

      {/* ── search ───────────────────────────────────────── */}
      <section className="px-6 md:px-10">
        <SearchWidget />
      </section>

      {/* ── popular fleet ────────────────────────────────── */}
      <section className="py-24 max-w-[1320px] mx-auto px-6 lg:px-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-display text-4xl font-bold text-dark mb-3">Popular Fleet</h2>
            <p className="text-muted">Our most requested vehicles for business and leisure.</p>
          </div>
          <Link to="/cars" className="text-dark font-semibold text-sm hover:underline flex items-center gap-1">
            View All <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)
            : cars.length > 0
              ? cars.map((c) => (
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
                <div className="col-span-3 text-center py-8 text-muted">
                  <p className="mb-4">Unable to load fleet right now.</p>
                  <Link to="/cars" className="btn-outline inline-flex">Browse Fleet</Link>
                </div>
              )
          }

          {/* promo card */}
          <div className="bg-dark rounded-[var(--radius-md)] p-8 text-white flex flex-col justify-center items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80"
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
              alt="" loading="lazy" aria-hidden="true"
            />
            <div className="relative z-20">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-white/30">Limited Offer</span>
              <h3 className="font-display text-2xl font-bold mb-3 whitespace-pre-line">{'Get 20% Off\nYour First Booking'}</h3>
              <p className="text-sm font-mono text-gray-300 mb-6 bg-black/40 px-3 py-1 rounded-md inline-block border border-white/10">Code: MODERN20</p>
              <br />
              <Link to="/cars" className="bg-white text-dark px-6 py-2.5 rounded-sm font-semibold text-sm hover:bg-gray-100 transition-colors inline-block">Book Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── features ─────────────────────────────────────── */}
      <section className="bg-white py-16 border-y border-border">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {FEATURES.map((f, i) => (
              <div key={f.icon} className={`flex flex-col items-center text-center ${i > 0 ? 'lg:border-l lg:border-border lg:pl-8' : ''}`}>
                <div className="w-14 h-14 rounded-full bg-off flex items-center justify-center text-dark mb-4 border border-border">
                  <span className="material-symbols-outlined text-[24px]">{f.icon}</span>
                </div>
                <h4 className="font-bold text-dark text-sm">{f.title}</h4>
                <p className="text-xs text-muted mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── how it works ─────────────────────────────────── */}
      <section className="py-24 bg-off">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10 text-center">
          <h2 className="font-display text-4xl font-bold text-dark mb-4">How It Works</h2>
          <p className="text-muted mb-16 max-w-xl mx-auto">Getting behind the wheel has never been easier. Just follow these 4 simple steps to start your journey.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="text-[120px] font-display font-extrabold text-border/40 absolute -top-16 left-1/2 -translate-x-1/2 -z-10 select-none">
                  0{i + 1}
                </div>
                <div className="w-20 h-20 mx-auto rounded-full bg-white shadow-sm border border-border flex items-center justify-center text-dark mb-6">
                  <span className="material-symbols-outlined text-[32px]">{step.icon}</span>
                </div>
                <h3 className="font-bold text-xl text-dark mb-2">{step.title}</h3>
                <p className="text-sm text-muted">{step.desc}</p>
                {i < 3 && <div className="hidden lg:block absolute top-10 -right-5 w-10 h-0.5 bg-border" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── services ─────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
          <h2 className="font-display text-4xl font-bold text-dark mb-12 text-center">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SERVICES.map((s) => (
              <div key={s.title} className="bg-off rounded-[var(--radius-md)] p-8 border border-border flex flex-col items-start hover:shadow-md transition-shadow">
                <span className="text-4xl mb-4">{s.emoji}</span>
                <h3 className="font-bold text-xl text-dark mb-2">{s.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── destinations marquee ──────────────────────────── */}
      <section className="py-16 bg-dark text-white overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10 mb-8">
          <h2 className="font-display text-3xl font-bold">Popular Destinations from Junagadh</h2>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-4 w-max animate-marquee">
            {[0, 1].flatMap((set) =>
              DESTINATIONS.map((d, i) => (
                <div key={`${set}-${i}`} className="flex-shrink-0 bg-white/10 border border-white/20 rounded-lg p-5 w-[240px] hover:bg-white/20 transition-colors cursor-default">
                  <h4 className="font-bold text-lg mb-1">{d.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    {d.distance}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── reviews ──────────────────────────────────────── */}
      <section className="py-24 bg-off">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10">
          <h2 className="font-display text-4xl font-bold text-dark mb-4 text-center">What Our Clients Say</h2>
          <p className="text-muted text-center mb-12 max-w-xl mx-auto">Real reviews from verified customers across Junagadh and Saurashtra region.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviewsLoading
              ? Array.from({ length: 3 }, (_, i) => <ReviewSkeleton key={i} />)
              : reviews.slice(0, 6).map((r) => (
                  <ReviewCard key={r._id} review={r} />
                ))
            }
          </div>
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
    <div className="bg-white p-8 rounded-[var(--radius-md)] border border-border shadow-sm relative flex flex-col">
      <span className="material-symbols-outlined text-yellow-400 text-4xl absolute top-6 right-6 opacity-20">format_quote</span>

      <div className="flex text-yellow-400 mb-4 text-lg tracking-wide">{stars}</div>

      <p className="text-muted italic mb-6 leading-relaxed flex-1">"{text}"</p>

      {(vehicle || tripType) && (
        <div className="flex flex-wrap gap-2 mb-5">
          {vehicle && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-off text-dark px-2.5 py-1 rounded-full border border-border">
              <span className="material-symbols-outlined text-[13px]">directions_car</span>
              {vehicle}
            </span>
          )}
          {tripType && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-off text-dark px-2.5 py-1 rounded-full border border-border">
              <span className="material-symbols-outlined text-[13px]">route</span>
              {tripType}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-5 border-t border-border">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
            {initials}
          </div>
          <span className="font-bold text-dark text-sm">{name}</span>
        </div>
        {verified && (
          <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-800 px-2 py-1 rounded font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[12px]">verified</span>
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
