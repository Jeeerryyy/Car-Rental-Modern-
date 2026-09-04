import Booking from '../models/Booking.js';
import { BOOKING_STATUS } from './constants.js';

export const injectBookingStatus = async (cars, dateRange = {}) => {
  if (!cars || cars.length === 0) return cars;

  const now = new Date();
  const carIds = cars.map(c => c._id);

  const targetStart = dateRange.startDate ? new Date(dateRange.startDate) : null;
  const targetEnd = dateRange.endDate ? new Date(dateRange.endDate) : null;
  const hasTargetRange = targetStart && targetEnd && !isNaN(targetStart.getTime()) && !isNaN(targetEnd.getTime());

  // Ten minutes threshold for pending checkout sessions
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const query = {
    car: { $in: carIds },
    $or: [
      { status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ACTIVE] } },
      { status: BOOKING_STATUS.PENDING, createdAt: { $gte: tenMinutesAgo } }
    ]
  };

  if (hasTargetRange) {
    query.$and = [
      {
        $or: [
          { startDate: { $lt: targetEnd }, endDate: { $gt: targetStart } },
          { startDate: { $lte: now }, endDate: { $gte: now } }
        ]
      }
    ];
  } else {
    query.endDate = { $gte: now };
  }

  const relevantBookings = await Booking.find(query).sort({ startDate: 1 }).lean();

  const carBookingsMap = {};
  for (const b of relevantBookings) {
    const cId = b.car.toString();
    if (!carBookingsMap[cId]) carBookingsMap[cId] = [];
    carBookingsMap[cId].push(b);
  }

  return cars.map(car => {
    const plainCar = car.toObject ? car.toObject() : { ...car };
    const cId = plainCar._id.toString();
    const bookings = carBookingsMap[cId] || [];

    const unavailableBlocks = (plainCar.unavailableDates || []).map(u => ({
      startDate: new Date(u.startDate),
      endDate: new Date(u.endDate),
      source: 'blocked',
      reason: u.reason || 'Maintenance'
    }));

    const bookingRanges = bookings.map(b => ({
      startDate: new Date(b.startDate),
      endDate: new Date(b.endDate),
      source: 'booking',
      status: b.status
    }));

    const allRanges = [...bookingRanges, ...unavailableBlocks].sort((a, b) => a.startDate - b.startDate);

    // Check if car is currently on an active trip
    const currentActive = allRanges.find(r => r.startDate <= now && r.endDate >= now);

    // Check if car conflicts with requested date range
    let conflictsWithTarget = false;
    if (hasTargetRange) {
      conflictsWithTarget = allRanges.some(r => r.startDate < targetEnd && r.endDate > targetStart);
    }

    const isBooked = hasTargetRange ? (conflictsWithTarget || !!currentActive) : !!currentActive;

    let bookedUntil = null;
    if (currentActive) {
      bookedUntil = currentActive.endDate;
    } else if (hasTargetRange && conflictsWithTarget) {
      const firstConflict = allRanges.find(r => r.startDate < targetEnd && r.endDate > targetStart);
      if (firstConflict) bookedUntil = firstConflict.endDate;
    }

    // Compute next available date
    let nextAvailableDate = new Date(now);
    if (currentActive) {
      let candidate = new Date(currentActive.endDate);
      for (const r of allRanges) {
        if (r.startDate <= candidate && r.endDate >= candidate) {
          candidate = new Date(r.endDate);
        }
      }
      nextAvailableDate = candidate;
    } else if (allRanges.length > 0) {
      // Find if there is a booking starting today
      const upcomingToday = allRanges.find(r => r.startDate > now && r.startDate.toDateString() === now.toDateString());
      if (upcomingToday) {
        nextAvailableDate = new Date(upcomingToday.endDate);
      }
    }

    return {
      ...plainCar,
      isBooked,
      bookedUntil,
      nextAvailableDate,
      bookedRanges: allRanges.map(r => ({
        startDate: r.startDate,
        endDate: r.endDate,
        source: r.source
      }))
    };
  });
};
