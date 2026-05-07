const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Promo = require('../models/Promo');
const logger = require('../utils/logger');

const DRIVER_RATE_PER_DAY = 500;

const bookingService = {
  async create(userId, bookingData) {
    const { carId, pickupDate, dropoffDate, pickupLocation, dropoffLocation, driverRequired, promoCode } = bookingData;
    
    const car = await Car.findById(carId);
    if (!car) throw new Error('Car not found');
    if (car.status === 'Maintenance') throw new Error('Vehicle under maintenance');

    const start = new Date(pickupDate);
    const end = new Date(dropoffDate);
    if (end <= start) throw new Error('Drop-off must be after pickup');

    const hours = Math.ceil((end - start) / 3600_000);
    const days = Math.max(1, Math.ceil(hours / 24));
    const driverCharge = driverRequired ? days * DRIVER_RATE_PER_DAY : 0;
    const pricePerDay = Number(car.pricePerDay) || 0;
    let basePrice = days * pricePerDay;

    let discountAmount = 0;
    if (promoCode) {
      const promo = await Promo.findOne({ code: promoCode.toUpperCase(), isActive: true });
      if (promo && start >= promo.validFrom && start <= promo.validTo) {
        if (!promo.usageLimit || promo.usedCount < promo.usageLimit) {
          if (promo.discountType === 'Fixed') {
            discountAmount = promo.discountValue;
          } else if (promo.discountType === 'Percentage') {
            discountAmount = (basePrice * promo.discountValue) / 100;
            if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
              discountAmount = promo.maxDiscount;
            }
          }
          promo.usedCount += 1;
          await promo.save();
        }
      }
    }

    const totalPrice = Math.max(basePrice - discountAmount + driverCharge, 0);
    const crypto = require('crypto');

    const booking = await Booking.create({
      userId,
      carId,
      pickupDate: start,
      dropoffDate: end,
      pickupLocation,
      dropoffLocation,
      status: 'Upcoming',
      basePrice,
      discountAmount,
      promoCode: promoCode ? promoCode.toUpperCase() : undefined,
      securityDeposit: car.securityDeposit || 1000,
      totalPrice,
      paymentMethod: bookingData.paymentMethod || 'Pending',
      paymentStatus: 'Pending',
      driverRequired: Boolean(driverRequired),
      confirmationNumber: crypto.randomBytes(4).toString('hex').toUpperCase(),
      termsAccepted: true,
    });

    await Car.findByIdAndUpdate(carId, { status: 'Rented' });
    logger.info(`[BOOKING] Created: ${booking._id} for user ${userId}`);
    return booking;
  },

  async findByUser(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    
    return Booking.find({ userId })
      .populate('carId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  },

  async findById(id) {
    return Booking.findById(id)
      .populate('carId')
      .populate('userId', 'name email phone')
      .lean();
  },

  async cancel(id, userId, reason) {
    const booking = await Booking.findById(id);
    if (!booking) throw new Error('Booking not found');
    if (booking.userId.toString() !== userId.toString()) throw new Error('Not authorized');
    if (!['Upcoming', 'Pending'].includes(booking.status)) {
      throw new Error('Only upcoming bookings can be cancelled');
    }

    booking.status = 'Cancelled';
    booking.cancelReason = reason || 'Not specified';
    await booking.save();
    await Car.findByIdAndUpdate(booking.carId, { status: 'Available' });
    
    logger.info(`[BOOKING] Cancelled: ${id}`);
    return booking;
  },

  async complete(id, extraCharges) {
    const { fuelOverageCharge = 0, lateReturnPenalty = 0, tollCharges = 0 } = extraCharges;
    
    const booking = await Booking.findById(id).populate('carId').populate('userId');
    if (!booking) throw new Error('Booking not found');
    if (booking.status === 'Completed') throw new Error('Already completed');

    booking.fuelOverageCharge = Number(fuelOverageCharge);
    booking.lateReturnPenalty = Number(lateReturnPenalty);
    booking.tollCharges = Number(tollCharges);
    booking.finalBilledAmount = booking.totalPrice + booking.fuelOverageCharge + booking.lateReturnPenalty + booking.tollCharges;
    booking.status = 'Completed';
    await booking.save();

    await Car.findByIdAndUpdate(booking.carId._id, { status: 'Available' });
    logger.info(`[BOOKING] Completed: ${id}, Final: ${booking.finalBilledAmount}`);
    return booking;
  }
};

module.exports = bookingService;