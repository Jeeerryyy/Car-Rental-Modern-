const express = require('express');
const router = express.Router();
const Booking = require('../../models/Booking');
const Car = require('../../models/Car');
const { ownerProtect } = require('../../middleware/auth');
const AnalyticsService = require('../../services/analyticsService');

router.get('/revenue', ownerProtect, async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const match = {
      status: { $in: ['confirmed', 'completed'] },
      paymentStatus: 'paid',
      createdAt: { $gte: start, $lte: end }
    };
    
    const bookings = await Booking.find(match)
      .populate('car', 'make model')
      .lean();
    
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.finalTotal || 0), 0);
    const totalBookings = bookings.length;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    
    const cancelledCount = await Booking.countDocuments({
      status: 'cancelled',
      createdAt: { $gte: start, $lte: end }
    });
    const cancellationRate = totalBookings > 0 ? (cancelledCount / (totalBookings + cancelledCount)) * 100 : 0;
    
    const carRevenue = {};
    bookings.forEach(b => {
      if (b.car) {
        const key = b.car._id.toString();
        if (!carRevenue[key]) {
          carRevenue[key] = { car: b.car, revenue: 0, bookings: 0 };
        }
        carRevenue[key].revenue += b.finalTotal || 0;
        carRevenue[key].bookings += 1;
      }
    });
    
    const topCars = Object.values(carRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    res.json({
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        averageBookingValue,
        cancellationRate: parseFloat(cancellationRate.toFixed(2)),
        topCars,
        revenueByPeriod: []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
});

router.get('/export', ownerProtect, async (req, res) => {
  try {
    const { format, startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    
    const bookings = await Booking.find({
      createdAt: { $gte: start, $lte: end }
    })
      .populate('car', 'make model')
      .populate('customer', 'name email')
      .lean();
    
    if (format === 'csv') {
      const csv = 'Booking ID,Car,Customer,Start,End,Days,Base Price,Deposit,Promo,Total,Status,Payment\n';
      const rows = bookings.map(b => 
        `${b._id},${b.car?.make || ''} ${b.car?.model || ''},${b.customer?.name || ''},${b.startDate},${b.endDate},${b.totalDays || 0},${b.basePrice || 0},${b.securityDeposit || 0},${b.discountAmount || 0},${b.finalTotal || 0},${b.status},${b.paymentStatus}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="report-${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(csv + rows);
    }
    
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to export' });
  }
});

router.get('/analytics', ownerProtect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await AnalyticsService.getOwnerAnalytics(
      req.owner._id,
      startDate,
      endDate
    );
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get analytics' });
  }
});

router.get('/revenue-chart', ownerProtect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const chartData = await AnalyticsService.getRevenueChart(
      req.owner._id,
      startDate,
      endDate
    );
    res.json({ success: true, data: chartData });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get chart data' });
  }
});

module.exports = router;