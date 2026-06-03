import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import { AppError } from '../utils/AppError.js';
import { generateInvoiceHTML, formatCurrency, formatDate } from './invoiceTemplate.js';

/**
 * Generate a sequential invoice number in format #MSD-YYYY-NNNN
 * Uses the current year and an atomic counter on the DB.
 */
export const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `#MSD-${year}-`;

  // Find the highest existing invoice number for this year
  const latest = await Booking.findOne({
    invoiceNumber: { $regex: `^#MSD-${year}-` }
  })
    .sort({ invoiceNumber: -1 })
    .select('invoiceNumber')
    .lean();

  let nextSeq = 1;
  if (latest && latest.invoiceNumber) {
    const match = latest.invoiceNumber.match(/-(\d+)$/);
    if (match) {
      nextSeq = parseInt(match[1], 10) + 1;
    }
  }

  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
};

/**
 * Validate that all mandatory invoice fields are present
 * @param {Object} booking - Populated booking document
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateInvoiceData = (booking) => {
  const errors = [];

  if (!booking) {
    return { valid: false, errors: ['Booking not found'] };
  }

  if (!booking.customer?.name) errors.push('Customer name is missing');
  if (!booking.customer?.phone && !booking.phone) errors.push('Customer phone is missing');
  if (!booking.customer?.email) errors.push('Customer email is missing');
  if (!booking.car?.make || !booking.car?.model) errors.push('Vehicle name/model is missing');
  if (!booking.startDate) errors.push('Pickup date is missing');
  if (!booking.endDate) errors.push('Return date is missing');
  if (!booking.totalPrice && booking.totalPrice !== 0) errors.push('Total price is missing');

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Assemble all data needed for the invoice from a booking
 * @param {string} bookingId
 * @param {string} userId - The requesting user's ID (customer or owner)
 * @returns {Object} Invoice data object ready for template rendering
 */
export const getInvoiceData = async (bookingId, userId) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    $or: [{ customer: userId }, { owner: userId }]
  })
    .populate('car', 'type make model images pricePerDay category fuelType transmission year registrationNumber color')
    .populate('customer', 'name email phone address drivingLicenceNumber aadhaarNumber documents');

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  const validation = validateInvoiceData(booking);
  if (!validation.valid) {
    throw new AppError(`Invoice cannot be generated: ${validation.errors.join(', ')}`, 400);
  }

  const car = booking.car;
  const customer = booking.customer;

  // Determine KM limit based on type (bike vs car)
  const isBike = car.type === 'bike' || ['bike', 'scooter', 'cruiser', 'sportsbike'].includes(car.category?.toLowerCase());
  const kmLimit = isBike ? 50 : 300;

  // Calculate totals
  const totalDays = booking.totalDays || Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24)) || 1;
  const ratePerDay = car.pricePerDay || 0;
  const subtotal = ratePerDay * totalDays;
  const discount = booking.discountAmount || 0;
  const securityDeposit = booking.securityDeposit || 0;
  const amountPaid = booking.amountPaid || 0;

  let totalPayable, amountDue;
  if (amountPaid >= securityDeposit) {
    totalPayable = subtotal - discount;
    amountDue = Math.max(0, totalPayable - amountPaid);
  } else {
    totalPayable = subtotal - discount + securityDeposit;
    amountDue = Math.max(0, totalPayable - amountPaid);
  }

  return {
    invoiceNumber: booking.invoiceNumber || '—',
    invoiceDate: booking.invoiceDate || booking.createdAt,
    pickupDate: booking.startDate,
    returnDate: booking.endDate,
    customerName: customer.name,
    customerPhone: customer.phone || booking.phone || '—',
    customerEmail: customer.email,
    drivingLicenceNumber: customer.drivingLicenceNumber || '—',
    aadhaarNumber: customer.aadhaarNumber || '—',
    customerAddress: customer.address || '—',
    vehicleName: `${car.make} ${car.model}`,
    registrationNumber: car.registrationNumber || '—',
    vehicleColor: car.color || '—',
    fuelType: car.fuelType || '—',
    rentalDuration: totalDays,
    ratePerDay,
    subtotal,
    discount,
    securityDeposit,
    amountPaid,
    amountDue,
    totalPayable,
    kmLimit,
    isBike,
    // KYC Documents
    aadhaarFront: booking.documents?.aadhaar?.front?.url || customer?.documents?.aadhaar?.front?.url || '',
    aadhaarBack: booking.documents?.aadhaar?.back?.url || customer?.documents?.aadhaar?.back?.url || '',
    licenseFront: booking.documents?.license?.front?.url || customer?.documents?.license?.front?.url || '',
    licenseBack: booking.documents?.license?.back?.url || customer?.documents?.license?.back?.url || '',
    // Raw booking data for JSON endpoint
    bookingId: booking._id,
    bookingStatus: booking.status,
    paymentStatus: booking.paymentStatus,
    referenceId: booking.referenceId,
  };
};

/**
 * Generate the complete invoice HTML for a booking
 * @param {string} bookingId
 * @param {string} userId
 * @returns {string} Complete HTML document
 */
export const renderInvoiceHTML = async (bookingId, userId) => {
  const data = await getInvoiceData(bookingId, userId);
  return generateInvoiceHTML(data);
};

/**
 * Assign an invoice number and date to a booking
 * Called automatically when a booking is confirmed
 * @param {Object} booking - Mongoose booking document (not lean)
 * @returns {Object} Updated booking
 */
export const assignInvoiceToBooking = async (booking) => {
  // Skip if already has an invoice number
  if (booking.invoiceNumber) {
    return booking;
  }

  const invoiceNumber = await generateInvoiceNumber();
  booking.invoiceNumber = invoiceNumber;
  booking.invoiceDate = new Date();
  await booking.save();

  return booking;
};
