import { useState, useEffect } from 'react';
import { carAPI, promoAPI } from '../services/api';
import { 
  ShieldIcon, 
  PhoneIcon, 
  CarIcon, 
  TagIcon, 
  PersonIcon
} from '../components/ui/Icons';
import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import PopularFleetSection from '../components/home/PopularFleetSection';
import FeaturesSection from '../components/home/FeaturesSection';
import TravelHubSection from '../components/home/TravelHubSection';
import ReviewsSection from '../components/home/ReviewsSection';

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
  { icon: <ShieldIcon className="w-5 h-5 text-accent" />,    title: 'Secure Booking',          desc: 'Your data is safe with us' },
  { icon: <PhoneIcon className="w-5 h-5 text-accent" />,     title: '24/7 Support',            desc: 'Available on call & WhatsApp' },
  { icon: <CarIcon className="w-5 h-5 text-accent" />,       title: 'Wide Selection',          desc: 'Cars, SUVs & Bikes available' },
  { icon: <TagIcon className="w-5 h-5 text-accent" />,       title: 'Best Prices',             desc: 'Competitive rates in Junagadh' },
  { icon: <PersonIcon className="w-5 h-5 text-accent" />,    title: 'With or Without Driver',  desc: 'Your choice, every time' },
];

const FALLBACK_REVIEWS = [
  { _id: '1', name: 'Nishant Sinojia', rating: 5, text: 'We hired self driving car for 7 days, process is much easy and smoother than other vendors. Car condition was good. Price is reasonable. Must recommend if you are looking for self drive option.', vehicle: '7 Days Rental', verified: true, avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
  { _id: '2', name: 'Nirav Shah', rating: 5, text: 'Extra ordinary service. We took a self-drive car (Fronx) from junagadh and had a trip to Gir - Somnath- Dwarka. Car was in excellent condition and we didn\'t face any issues.', vehicle: 'Suzuki Fronx', verified: true, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
  { _id: '3', name: 'Hemang Mehta', rating: 5, text: 'I recently rented a car from modern self drive in Junagadh and had an awesome experience! They have a fleet of brand-new, well-maintained cars. A special thanks to Wasim bhai, the owner.', vehicle: 'Self Drive', verified: true, avatar: 'https://images.pexels.com/photos/2100063/pexels-photo-2100063.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
  { _id: '4', name: 'Parth Racka', rating: 5, text: 'Best Car Service ever. The support is awesome. Highly trustable and professional behavior.', vehicle: 'Premium Service', verified: true, avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
  { _id: '5', name: 'Ravi Bagthariya', rating: 5, text: 'Good service and car quality very nice. One of the most reliable options in Junagadh region.', vehicle: 'Hatchback', verified: true, avatar: 'https://images.pexels.com/photos/775358/pexels-photo-775358.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
];

function Home() {
  const [loading, setLoading] = useState(false);
  const [featuredCars, setFeaturedCars] = useState([]);
  const [featuredPromo, setFeaturedPromo] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('gir-national-park');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [carsRes, promoRes] = await Promise.all([
          carAPI.getFeatured(),
          promoAPI.getFeatured()
        ]);
        setFeaturedCars(carsRes.data.data?.cars || carsRes.data.data || []);
        setFeaturedPromo(promoRes.data.data?.promo || null);
      } catch {
        setFeaturedCars([]);
        setFeaturedPromo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopyCode = () => {
    const code = featuredPromo?.code || 'MODERN20';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main id="main-content" className="overflow-x-hidden" style={{ background: '#F9F8F3' }}>
      <HeroSection />
      <AboutSection />

      <section className="py-6 overflow-hidden" style={{ borderTop: '1px solid rgba(182,124,61,0.15)', borderBottom: '1px solid rgba(182,124,61,0.15)', background: '#F2EEE5' }}>
        <div className="relative w-full flex items-center">
          <div className="flex gap-4 w-max animate-marquee text-lg font-bold" style={{ color: '#19130E' }}>
            {[0, 1].flatMap((set) =>
              DESTINATIONS.map((d, i) => (
                <div key={`${set}-${i}`} className="flex items-center gap-4">
                  <span className="whitespace-nowrap">
                    {d.name} <span className="font-medium text-sm" style={{ color: '#6b5e50' }}>({d.distance})</span>
                  </span>
                  <span className="mx-2 text-sm" style={{ color: 'rgba(182,124,61,0.3)' }}>•</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <PopularFleetSection loading={loading} cars={featuredCars} promo={featuredPromo} copied={copied} handleCopyCode={handleCopyCode} />
      <FeaturesSection features={FEATURES} />
      <TravelHubSection selectedDestination={selectedDestination} setSelectedDestination={setSelectedDestination} />
      <ReviewsSection reviews={FALLBACK_REVIEWS} reviewsLoading={false} />
    </main>
  );
}

export default Home;
