import React from 'react';
import { 
  UsersIcon, 
  FuelIcon, 
  SettingsIcon, 
  TransmissionIcon,
  ShieldCheckIcon,
  LockIcon,
  PhoneIcon,
  CheckCircleIcon
} from '../ui/Icons';

export default function CarInfo({ car }) {
  const features = [
    { label: 'Verified Vehicle', icon: ShieldCheckIcon, desc: 'Passed 150+ point quality check' },
    { label: 'Insurance Included', icon: LockIcon, desc: 'Zero depreciation insurance coverage' },
    { label: '24/7 Roadside', icon: PhoneIcon, desc: 'Instant support anywhere, anytime' },
    { label: 'Sanitized Car', icon: CheckCircleIcon, desc: 'Deep cleaned before every delivery' }
  ];

  const isBike = car.type === 'bike' || ['bike', 'scooter', 'cruiser', 'sportsbike'].includes(car.category?.toLowerCase());
  const kmLimitSpec = isBike ? '50 KM/Day' : '300 KM/Day';

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Transmission', value: car.transmission, icon: TransmissionIcon },
          { label: 'Capacity', value: `${car.seats} Seats`, icon: UsersIcon },
          { label: 'Fuel Type', value: car.fuelType, icon: FuelIcon },
          { label: 'Kilometers', value: kmLimitSpec, icon: SettingsIcon }
        ].map(spec => (
          <div key={spec.label} className="p-6 rounded-[12px]" style={{ background: '#E7E0D4', border: '1px solid #D6D0C7' }}>
            <spec.icon className="w-6 h-6 mb-4" style={{ color: '#5C5C5C' }} />
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#5C5C5C' }}>{spec.label}</p>
            <p className="text-sm font-bold" style={{ color: '#121212' }}>{spec.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-2xl font-display font-bold mb-6" style={{ color: '#121212' }}>About this Vehicle</h2>
        <p className="leading-relaxed mb-8" style={{ color: '#5C5C5C' }}>
          The {car.make} {car.model} offers an exceptional blend of performance, comfort, and state-of-the-art technology. 
          Perfect for both urban navigation and long-distance cruising, this vehicle is meticulously maintained.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-12 h-12 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: '#E7E0D4', border: '1px solid rgba(182,124,61,0.1)' }}>
                <f.icon className="w-6 h-6" style={{ color: '#121212' }} />
              </div>
              <div>
                <h4 className="font-bold text-sm" style={{ color: '#121212' }}>{f.label}</h4>
                <p className="text-xs mt-1" style={{ color: '#5C5C5C' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
