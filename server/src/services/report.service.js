import Booking from '../models/Booking.js';
import { AppError } from '../utils/AppError.js';
import { BOOKING_STATUS } from '../utils/constants.js';
import cacheService from '../config/redis.js';
import { logger } from '../utils/logger.js';

export const getRevenueReport = async (ownerId, startDate, endDate) => {
  const query = {
    owner: ownerId,
    status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ACTIVE, BOOKING_STATUS.COMPLETED] },
    paymentStatus: 'paid'
  };

  if (startDate) {
    query.startDate = { $gte: new Date(startDate) };
  }
  if (endDate) {
    query.endDate = { $lte: new Date(endDate) };
  }

  const bookings = await Booking.find(query)
    .populate('car', 'make model')
    .populate('customer', 'name email');

  const monthlyData = {};
  bookings.forEach(booking => {
    const month = new Date(booking.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthlyData[month]) {
      monthlyData[month] = { revenue: 0, bookings: 0 };
    }
    monthlyData[month].revenue += booking.totalPrice;
    monthlyData[month].bookings += 1;
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    _id: month,
    totalRevenue: data.revenue,
    count: data.bookings
  }));
};

export const getFleetReport = async (ownerId) => {
  const bookings = await Booking.find({ owner: ownerId, status: { $ne: 'pending' } })
    .populate('car', 'make model pricePerDay');

  const carStats = {};
  bookings.forEach(booking => {
    const carId = booking.car._id.toString();
    if (!carStats[carId]) {
      carStats[carId] = {
        car: booking.car,
        bookings: 0,
        revenue: 0
      };
    }
    carStats[carId].bookings += 1;
    if (booking.status === BOOKING_STATUS.COMPLETED) {
      carStats[carId].revenue += booking.totalPrice;
    }
  });

  return Object.values(carStats).map(stat => ({
    _id: `${stat.car.make} ${stat.car.model}`,
    totalRevenue: stat.revenue,
    count: stat.bookings
  }));
};

export const getBookingsReport = async (ownerId, startDate, endDate) => {
  const query = { owner: ownerId, status: { $ne: 'pending' } };

  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = new Date(startDate);
    if (endDate) query.startDate.$lte = new Date(endDate);
  }

  const bookings = await Booking.find(query)
    .populate('car', 'make model')
    .populate('customer', 'name email');

  const statusCounts = {
    pending: { count: 0, revenue: 0 },
    confirmed: { count: 0, revenue: 0 },
    active: { count: 0, revenue: 0 },
    completed: { count: 0, revenue: 0 },
    cancelled: { count: 0, revenue: 0 }
  };

  bookings.forEach(booking => {
    statusCounts[booking.status].count += 1;
    if (booking.paymentStatus === 'paid') {
      statusCounts[booking.status].revenue += booking.totalPrice;
    }
  });

  return Object.entries(statusCounts).map(([status, data]) => ({
    _id: status.charAt(0).toUpperCase() + status.slice(1),
    totalRevenue: data.revenue,
    count: data.count
  }));
};

export const exportBookingsCSV = async (ownerId, startDate, endDate) => {
  const query = { owner: ownerId, status: { $ne: 'pending' } };

  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = new Date(startDate);
    if (endDate) query.startDate.$lte = new Date(endDate);
  }

  const bookings = await Booking.find(query)
    .populate('car', 'make model licensePlate')
    .populate('customer', 'name email phone')
    .sort({ createdAt: -1 });

  const headers = ['Booking ID', 'Customer', 'Email', 'Phone', 'Car', 'Plate', 'Start Date', 'End Date', 'Total', 'Status', 'Payment'];
  const rows = bookings.map(b => [
    b._id.toString(),
    b.customer?.name || 'N/A',
    b.customer?.email || 'N/A',
    b.customer?.phone || 'N/A',
    `${b.car?.make} ${b.car?.model}`,
    b.car?.licensePlate || 'N/A',
    new Date(b.startDate).toLocaleDateString(),
    new Date(b.endDate).toLocaleDateString(),
    b.totalPrice,
    b.status,
    b.paymentStatus
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  return csvContent;
};

export const getDashboardStats = async (ownerId) => {
  const cacheKey = `owner:dashboard-stats:${ownerId}`;
  try {
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }
  } catch (err) {
    logger.warn('Cache read error in getDashboardStats:', err);
  }

  const [revenueResult, activeBookings, totalCars, availableCars] = await Promise.all([
    Booking.aggregate([
      { 
        $match: { 
          owner: ownerId, 
          status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ACTIVE, BOOKING_STATUS.COMPLETED] }, 
          paymentStatus: 'paid' 
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]),
    Booking.countDocuments({ owner: ownerId, status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ACTIVE] } }),
    (await import('../models/Car.js')).default.countDocuments({ owner: ownerId, isDeleted: false }),
    (await import('../models/Car.js')).default.countDocuments({ owner: ownerId, isDeleted: false, isActive: true })
  ]);

  const stats = {
    totalRevenue: revenueResult[0]?.total || 0,
    activeBookings,
    totalCars,
    availableCars
  };

  try {
    // Cache owner dashboard statistics for 3600 seconds (1 hour)
    await cacheService.set(cacheKey, stats, 3600);
  } catch (err) {
    logger.warn('Cache write error in getDashboardStats:', err);
  }

  return stats;
};
