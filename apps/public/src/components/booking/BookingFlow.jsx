import { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { ArrowRightIcon } from '../ui/Icons';

export default function BookingFlow({ isOpen, onClose, car, bookingData, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleBookNow = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Booking is currently unavailable. Please contact support.');
    }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Unavailable" showClose={!loading} maxWidth="max-w-xl" showFooter={false}>
      <div className="py-4 text-center">
        <p className="text-muted mb-4">Online booking is currently unavailable.</p>
        <p className="text-sm text-muted">Please contact us directly to make a booking.</p>
      </div>
      <div className="flex justify-center gap-3 mt-6">
        <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg">Close</button>
      </div>
    </Modal>
  );
}