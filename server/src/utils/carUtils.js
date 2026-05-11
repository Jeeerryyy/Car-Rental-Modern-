import Booking from '../models/Booking.js';

export const injectBookingStatus = async (cars) => {
  if (!cars || cars.length === 0) return cars;
  
  const today = new Date();
  const carIds = cars.map(c => c._id);
  
  const activeBookings = await Booking.find({
    car: { $in: carIds },
    status: { $in: ['confirmed', 'active'] },
    startDate: { $lte: today },
    endDate: { $gte: today }
  });

  const bookingsMap = activeBookings.reduce((acc, b) => {
    acc[b.car.toString()] = b;
    return acc;
  }, {});

  return cars.map(car => {
    const booking = bookingsMap[car._id.toString()];
    const plainCar = car.toObject ? car.toObject() : car;
    return {
      ...plainCar,
      isBooked: !!booking,
      bookedUntil: booking ? booking.endDate : null
    };
  });
};
