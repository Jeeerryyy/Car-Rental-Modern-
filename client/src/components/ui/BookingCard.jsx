// BookingCard — displays a single booking for the user profile

const BookingCard = ({ booking, onCancel }) => {
  const isCancellable = booking.status === 'Upcoming';

  const statusStyles = {
    Upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
    Active: 'bg-green-100 text-green-800 border-green-200',
    Completed: 'bg-gray-100 text-gray-800 border-gray-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="bg-white rounded-[var(--radius-md)] overflow-hidden shadow-sm border border-border flex flex-col md:flex-row group">
      
      {/* Image Area */}
      <div className="w-full md:w-1/3 h-48 md:h-auto bg-off relative p-6 flex items-center justify-center">
        <img 
          src={booking.carId?.images?.[0] || 'https://via.placeholder.com/300x200?text=Car'} 
          alt={booking.carId?.make}
          loading="lazy"
          className="w-full h-full object-contain"
        />
        <div className={`absolute top-4 left-4 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${statusStyles[booking.status]}`}>
          {booking.status}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-display text-2xl font-bold text-dark">
                {booking.carId?.make} {booking.carId?.model}
              </h3>
              <p className="text-sm text-muted mt-1 font-medium">Ref: <span className="text-dark font-mono">{booking.confirmationNumber}</span></p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-dark">₹{Number(booking.totalPrice).toLocaleString('en-IN')}</span>
              <span className="block text-xs text-muted font-medium mt-1">Total Paid</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-off p-4 rounded-md border border-border">
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Pick-up</p>
              <p className="font-semibold text-sm text-dark">{new Date(booking.pickupDate).toLocaleDateString()}</p>
              <p className="text-xs text-muted truncate mt-0.5">{booking.pickupLocation}</p>
            </div>
            <div className="w-8 flex justify-center text-muted"><span className="material-symbols-outlined">arrow_right_alt</span></div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Drop-off</p>
              <p className="font-semibold text-sm text-dark">{new Date(booking.dropoffDate).toLocaleDateString()}</p>
              <p className="text-xs text-muted truncate mt-0.5">{booking.dropoffLocation}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between items-center">
          {isCancellable ? (
            <button onClick={() => onCancel(booking._id)} className="text-red-600 font-semibold text-sm hover:underline">
              Cancel Reservation
            </button>
          ) : (
             <span className="text-muted text-sm italic">
              {booking.status === 'Completed' ? 'Hope you enjoyed the ride.' : booking.status === 'Cancelled' ? 'This reservation was cancelled.' : 'Currently driving.'}
            </span>
          )}
          <a href="#" className="font-semibold text-sm text-dark hover:underline flex items-center gap-1">
            Manage Booking <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
