const Booking = require('../models/Booking');
const Car = require('../models/Car');

const getDashboardKPIs = async () => {
  // 1. Total Revenue (Completed & Active Bookings)
  const revenueStats = await Booking.aggregate([
    { $match: { status: { $in: ['completed', 'active', 'confirmed'] } } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
  ]);
  const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

  // 2. Active Bookings
  const activeBookings = await Booking.countDocuments({ status: 'active' });

  // 3. Fleet Size & Available Cars
  const totalCars = await Car.countDocuments();
  const availableCars = await Car.countDocuments({ status: 'Available' });

  // 4. Recent Bookings (Limit 5)
  const recentBookings = await Booking.find()
    .sort('-createdAt')
    .limit(5)
    .populate('customer', 'name email phone')
    .populate('car', 'make model licensePlate');

  return {
    kpis: {
      totalRevenue,
      activeBookings,
      totalCars,
      availableCars
    },
    recentBookings
  };
};

const getClients = async () => {
  // Aggregate customers based on their bookings
  const clients = await Booking.aggregate([
    {
      $group: {
        _id: '$customer',
        totalBookings: { $sum: 1 },
        totalSpent: { $sum: '$totalPrice' },
        lastBookingDate: { $max: '$createdAt' }
      }
    },
    {
      $lookup: {
        from: 'customers', // Note: Make sure collection name is correct
        localField: '_id',
        foreignField: '_id',
        as: 'customerDetails'
      }
    },
    {
      $unwind: '$customerDetails'
    },
    {
      $project: {
        _id: 1,
        totalBookings: 1,
        totalSpent: 1,
        lastBookingDate: 1,
        name: '$customerDetails.name',
        email: '$customerDetails.email',
        phone: '$customerDetails.phone',
        status: '$customerDetails.status'
      }
    },
    { $sort: { lastBookingDate: -1 } }
  ]);
  
  return clients;
};

module.exports = {
  getDashboardKPIs,
  getClients
};
