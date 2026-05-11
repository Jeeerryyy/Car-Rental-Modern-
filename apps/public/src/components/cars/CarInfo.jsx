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

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Transmission', value: car.transmission, icon: TransmissionIcon },
          { label: 'Capacity', value: `${car.seats} Seats`, icon: UsersIcon },
          { label: 'Fuel Type', value: car.fuelType, icon: FuelIcon },
          { label: 'Kilometers', value: 'Unlimited', icon: SettingsIcon }
        ].map(spec => (
          <div key={spec.label} className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:border-dark transition-all">
            <spec.icon className="w-6 h-6 text-muted mb-4 group-hover:text-dark transition-colors" />
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">{spec.label}</p>
            <p className="text-sm font-bold text-dark">{spec.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-2xl font-display font-bold text-dark mb-6">About this Vehicle</h2>
        <p className="text-muted leading-relaxed mb-8">
          The {car.make} {car.model} offers an exceptional blend of performance, comfort, and state-of-the-art technology. 
          Perfect for both urban navigation and long-distance cruising, this vehicle is meticulously maintained.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-off border border-border flex items-center justify-center shrink-0">
                <f.icon className="w-6 h-6 text-dark" />
              </div>
              <div>
                <h4 className="font-bold text-dark text-sm">{f.label}</h4>
                <p className="text-xs text-muted mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
