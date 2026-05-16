const UsersIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const FuelIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 22V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M14 6h3l3 3v10a1 1 0 0 1-1 1h-2" />
    <line x1="3" y1="22" x2="14" y2="22" />
  </svg>
);

const GearIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
  </svg>
);

const ClockIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

export default function VehicleSpecs({ car }) {
  return (
    <>
      <div className="flex border border-outline-variant mb-8 -mx-px">
        {[
          { icon: <UsersIcon />, label: 'Capacity', val: car.seats ? `${car.seats} Seats` : 'N/A' },
          { icon: <FuelIcon />, label: 'Fuel Type', val: car.fuelType || 'N/A' },
          { icon: <GearIcon />, label: 'Transmission', val: car.transmission || 'N/A' },
          { icon: <ClockIcon />, label: 'Min Days', val: '1 Day' },
        ].map(({ icon, label, val }) => (
          <div key={label} className="flex-1 flex items-center gap-3 p-4 border-r border-outline-variant last:border-r-0">
            <span className="text-secondary flex-shrink-0">{icon}</span>
            <div>
              <div className="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant">{label}</div>
              <div className="text-[13px] font-bold text-on-surface mt-0.5">{val}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-headline-xl text-on-surface mb-3" style={{ fontSize: '28px', letterSpacing: '0.02em' }}>
        About this {car.type === 'bike' ? 'bike' : 'car'}
      </h2>
      <p className="text-on-surface-variant text-sm leading-relaxed mb-8">{car.description}</p>

      {car.features?.length > 0 && (
        <>
          <h2 className="font-headline-xl text-on-surface mb-3" style={{ fontSize: '28px', letterSpacing: '0.02em' }}>
            Features & Amenities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-8">
            {car.features.map(f => (
              <div key={f} className="flex items-center gap-2.5 p-3 bg-surface-variant border border-outline-variant text-[12px] font-semibold text-on-surface-variant">
                <div className="w-5 h-5 bg-secondary flex items-center justify-center flex-shrink-0">
                  <CheckIcon />
                </div>
                {f}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}