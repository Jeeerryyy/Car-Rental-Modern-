const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Customer = require('../models/Customer');
const Owner = require('../models/Owner');

class AnalyticsService {
  static async getOwnerAnalytics(ownerId, startDate, endDate) {
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const [totalBookings, revenue, carStats, customerStats] = await Promise.all([
      Booking.countDocuments({ owner: ownerId, createdAt: dateFilter }),
      Booking.aggregate([
        { $match: { owner: ownerId, createdAt: dateFilter, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$finalTotal' } } }
      ]),
      Car.aggregate([
        { $match: { owner: ownerId } },
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'car',
            pipeline: [{ $match: { createdAt: dateFilter } }],
            as: 'bookings'
          }
        },
        { $project: { make: 1, model: 1, totalBookings: { $size: '$bookings' } } },
        { $sort: { totalBookings: -1 } },
        { $limit: 10 }
      ]),
      Booking.aggregate([
        { $match: { owner: ownerId, createdAt: dateFilter } },
        { $group: { _id: '$customer', count: { $sum: 1 }, totalSpent: { $sum: '$finalTotal' } } },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
          $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' }
        },
        { $unwind: '$customer' },
        { $project: { name: '$customer.name', email: '$customer.email', count: 1, totalSpent: 1 } }
      ])
    ]);

    return {
      totalBookings,
      totalRevenue: revenue[0]?.total || 0,
      topCars: carStats,
      topCustomers: customerStats,
      period: { startDate, endDate }
    };
  }

  static async getPlatformAnalytics(startDate, endDate) {
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const [totalBookings, totalRevenue, activeOwners, activeCustomers, categoryBreakdown] = await Promise.all([
      Booking.countDocuments({ createdAt: dateFilter }),
      Booking.aggregate([
        { $match: { createdAt: dateFilter, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$finalTotal' } } }
      ]),
      Owner.countDocuments({ isVerified: true }),
      Customer.countDocuments({ createdAt: dateFilter }),
      Booking.aggregate([
        { $match: { createdAt: dateFilter, paymentStatus: 'paid' } },
        {
          $lookup: { from: 'cars', localField: 'car', foreignField: '_id', as: 'car' }
        },
        { $unwind: '$car' },
        { $group: { _id: '$car.category', revenue: { $sum: '$finalTotal' }, count: { $sum: 1 } } }
      ])
    ]);

    return {
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      activeOwners,
      activeCustomers,
      categoryBreakdown,
      period: { startDate, endDate }
    };
  }

  static async getRevenueChart(ownerId, startDate, endDate) {
    const match = { owner: ownerId, paymentStatus: 'paid' };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    return Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$finalTotal' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }
}

module.exports = AnalyticsService;