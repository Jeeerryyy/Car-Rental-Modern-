/**
 * WhatsApp Reminder, Dispatch & Notification Engine
 * Specifically tailored for Modern Drive Self-Drive Cars & Fleet
 * Junagadh, Gujarat
 */

export const DEFAULT_COMPANY_NAME = 'Modern Drive';
export const DEFAULT_CAR_RENTAL_COMPANY_NAME = 'Modern Selfdrive Car Rental';
export const DEFAULT_HELPLINE_NUMBER = '+91 90044 60634 / +91 84692 65000';
export const DEFAULT_PICKUP_HUB = 'GIDC-1, Near Mahaveer Marble, Dolatpara, Junagadh 362037';
export const DEFAULT_GOOGLE_MAPS_LINK = 'https://g.page/modern-selfdrive';
export const DEFAULT_WEBSITE = 'https://modernselfdrive.in';
export const DEFAULT_EMAIL = 'booking@modernselfdrive.in';
export const DEFAULT_SECURITY_DEPOSIT = 2000;

export function formatDateSafe(d) {
  if (!d) return 'Scheduled Date';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return String(d);
  }
}

function extractTime(dtStr, defaultFallback = '10:00 AM') {
  if (!dtStr) return defaultFallback;
  try {
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return defaultFallback;
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return defaultFallback;
  }
}

/**
 * Intelligent Indian / International phone number sanitizer
 * - Strips non-digits
 * - Strips leading zero if 11 digits
 * - Prepends 91 country code for 10-digit Indian numbers
 */
export function sanitizeWhatsAppPhone(phone) {
  if (!phone) return '';
  let clean = String(phone).replace(/[^0-9]/g, '');
  if (!clean) return '';
  if (clean.length === 11 && clean.startsWith('0')) clean = clean.substring(1);
  if (clean.length === 10) clean = `91${clean}`;
  return clean;
}

export function isValidWhatsAppPhone(phone) {
  if (!phone) return false;
  const clean = sanitizeWhatsAppPhone(phone);
  return clean.length >= 10 && clean.length <= 15;
}

export function formatDisplayPhone(phone) {
  if (!phone) return '';
  const clean = sanitizeWhatsAppPhone(phone);
  if (!clean) return phone;
  if (clean.startsWith('91') && clean.length === 12) {
    const main = clean.substring(2);
    return `+91 ${main.substring(0, 5)} ${main.substring(5)}`;
  }
  return `+${clean}`;
}

/**
 * Multi-field resilient data extraction from Modern Drive MongoDB schema & API responses
 */
export function extractBookingDetails(raw) {
  if (!raw) {
    return {
      vertical: 'fleet',
      customer_name: 'Valued Customer',
      customer_phone: '',
      raw_customer_phone: '',
      display_phone: 'No phone number on file',
      customer_email: '',
      booking_id: '#MD-0000',
      raw_code: 'MD-0000',
      vehicle_name: 'Modern Drive Vehicle',
      vehicle_number: 'GJ 11 AB 1234',
      service_type: 'Self-Drive Car Rental',
      pax_count: '5 Seats',
      pickup_date: 'Scheduled Date',
      pickup_time: '10:00 AM',
      dropoff_date: 'Return Date',
      dropoff_time: '10:00 AM',
      pickup_location: DEFAULT_PICKUP_HUB,
      total_amount: '0',
      advance_paid: '0',
      balance_amount: '0',
      security_deposit: '0',
      driver_details: 'Self-Drive (Customer Drive)',
      company_name: DEFAULT_COMPANY_NAME,
      helpline_number: DEFAULT_HELPLINE_NUMBER,
      google_maps_link: DEFAULT_GOOGLE_MAPS_LINK,
      website_url: DEFAULT_WEBSITE,
      status: 'Confirmed',
      is_fleet: true,
      clean_phone: '',
      is_phone_valid: false,
    };
  }

  const rawCode =
    raw.referenceId ||
    raw.bookingCode ||
    raw.booking_code ||
    raw.id ||
    raw._id ||
    `MD-${Math.floor(1000 + Math.random() * 9000)}`;

  const bookingIdFormatted = String(rawCode).startsWith('#') ? rawCode : `#${rawCode}`;

  const customerName =
    raw.customer?.name ||
    raw.customerName ||
    raw.customer_name ||
    raw.fullName ||
    raw.name ||
    'Valued Customer';

  const rawCustomerPhone =
    raw.phone ||
    raw.customer?.phone ||
    raw.customerPhone ||
    raw.customer_phone ||
    raw.mobile ||
    raw.contactNumber ||
    raw.contact_number ||
    raw.userPhone ||
    raw.guestPhone ||
    raw.customerDetails?.phone ||
    raw.customerDetails?.customerPhone ||
    raw.user?.phone ||
    '';

  const cleanPhone = sanitizeWhatsAppPhone(rawCustomerPhone);
  const displayPhone = formatDisplayPhone(rawCustomerPhone) || 'No phone on file';
  const isPhoneValid = isValidWhatsAppPhone(rawCustomerPhone);

  const customerEmail =
    raw.customer?.email ||
    raw.customerEmail ||
    raw.customer_email ||
    raw.email ||
    raw.user?.email ||
    '';

  // Extract vehicle / car name
  const vehicleName =
    (raw.car?.make && raw.car?.model ? `${raw.car.make} ${raw.car.model}` : null) ||
    raw.car?.model ||
    raw.vehicleId?.name ||
    raw.vehicleName ||
    'Modern Drive Self-Drive Car';

  const serviceType = raw.serviceType || raw.service_type || `${vehicleName} Self-Drive`;

  const vehicleNumber =
    raw.car?.registrationNumber ||
    raw.vehicleId?.regNumber ||
    raw.vehicleId?.reg_number ||
    raw.vehicleNumber ||
    raw.regNumber ||
    raw.reg_number ||
    'GJ 11 AB 1234';

  const paxCountNum = raw.paxCount || raw.seats || raw.car?.seats || 5;
  const paxCount = `${paxCountNum} Seats`;

  const pickupRaw =
    raw.startDate ||
    raw.pickupDatetime ||
    raw.pickup_datetime ||
    raw.pickupDate ||
    raw.travelDate;

  const dropoffRaw =
    raw.endDate ||
    raw.dropoffDatetime ||
    raw.dropoff_datetime ||
    raw.dropoffDate ||
    raw.returnDate;

  const pickupDateFormatted = pickupRaw ? formatDateSafe(pickupRaw) : 'Scheduled Date';
  const pickupTimeFormatted = raw.pickupTime || extractTime(pickupRaw, '10:00 AM');

  const dropoffDateFormatted = dropoffRaw ? formatDateSafe(dropoffRaw) : (pickupRaw ? formatDateSafe(pickupRaw) : 'Return Date');
  const dropoffTimeFormatted = raw.dropoffTime || raw.returnTime || extractTime(dropoffRaw, '10:00 AM');

  const pickupLocation =
    raw.pickupLocation ||
    raw.pickup_location ||
    raw.location ||
    DEFAULT_PICKUP_HUB;

  const totalNum = Number(
    raw.totalPrice ??
    raw.totalAmount ??
    raw.total_amount ??
    raw.totalRentalAmount ??
    raw.total_rental_amount ??
    0
  );

  const advanceNum = Number(
    raw.amountPaid ??
    raw.depositAmount ??
    raw.depositPaid ??
    raw.deposit_paid ??
    raw.advancePaid ??
    0
  );

  const balanceNum = Math.max(0, totalNum - advanceNum);

  const securityDepositNum = Number(
    raw.securityDeposit ??
    raw.securityDepositAmount ??
    DEFAULT_SECURITY_DEPOSIT
  );

  return {
    vertical: 'fleet',
    customer_name: customerName,
    customer_phone: cleanPhone,
    raw_customer_phone: rawCustomerPhone,
    display_phone: displayPhone,
    customer_email: customerEmail,
    booking_id: bookingIdFormatted,
    raw_code: rawCode,
    vehicle_name: vehicleName,
    vehicle_number: vehicleNumber,
    service_type: serviceType,
    pax_count: paxCount,
    pickup_date: pickupDateFormatted,
    pickup_time: pickupTimeFormatted,
    dropoff_date: dropoffDateFormatted,
    dropoff_time: dropoffTimeFormatted,
    pickup_location: pickupLocation,
    total_amount: totalNum.toLocaleString('en-IN'),
    advance_paid: advanceNum.toLocaleString('en-IN'),
    balance_amount: balanceNum.toLocaleString('en-IN'),
    security_deposit: securityDepositNum.toLocaleString('en-IN'),
    driver_details: 'Self-Drive (Customer Drive)',
    company_name: DEFAULT_COMPANY_NAME,
    helpline_number: DEFAULT_HELPLINE_NUMBER,
    google_maps_link: DEFAULT_GOOGLE_MAPS_LINK,
    website_url: DEFAULT_WEBSITE,
    status: raw.status || 'Confirmed',
    is_fleet: true,
    clean_phone: cleanPhone,
    is_phone_valid: isPhoneValid,
  };
}

export function renderBookingTemplate(templateBody, bookingData) {
  const details = extractBookingDetails(bookingData);

  return templateBody
    .replace(/\{customer_name\}/g, details.customer_name)
    .replace(/\{booking_id\}/g, details.booking_id)
    .replace(/\{vehicle_name\}/g, details.vehicle_name)
    .replace(/\{vehicle_number\}/g, details.vehicle_number)
    .replace(/\{service_type\}/g, details.service_type)
    .replace(/\{pax_count\}/g, details.pax_count)
    .replace(/\{pickup_date\}/g, details.pickup_date)
    .replace(/\{pickup_time\}/g, details.pickup_time)
    .replace(/\{dropoff_date\}/g, details.dropoff_date)
    .replace(/\{dropoff_time\}/g, details.dropoff_time)
    .replace(/\{pickup_location\}/g, details.pickup_location)
    .replace(/\{total_amount\}/g, details.total_amount)
    .replace(/\{advance_paid\}/g, details.advance_paid)
    .replace(/\{balance_amount\}/g, details.balance_amount)
    .replace(/\{security_deposit\}/g, details.security_deposit)
    .replace(/\{driver_details\}/g, details.driver_details)
    .replace(/\{company_name\}/g, details.company_name)
    .replace(/\{helpline_number\}/g, details.helpline_number)
    .replace(/\{google_maps_link\}/g, details.google_maps_link)
    .replace(/\{website_url\}/g, details.website_url);
}

/**
 * 6 Official Modern Drive WhatsApp Templates (Self-Drive Cars, Bikes & Fleet)
 */
export const MODERN_DRIVE_TEMPLATES = [
  {
    id: 'modern_booking_confirmation',
    title: 'Booking Confirmation & Handover Checklist',
    icon: '🚗',
    category: 'dispatch',
    description: 'Confirmed booking summary, vehicle details, schedule, fare breakdown & KYC checklist',
    template:
      'Namaste {customer_name} 🙏\n\nThank you for choosing *{company_name}*! Your self-drive vehicle booking has been confirmed. 🚗✨\n\n📋 *Booking Summary:*\n• *Booking ID:* {booking_id}\n• *Vehicle:* {vehicle_name} ({vehicle_number})\n• *Pickup Schedule:* {pickup_date} at {pickup_time}\n• *Drop-off Schedule:* {dropoff_date} at {dropoff_time}\n• *Pickup Hub / Location:* {pickup_location}\n\n💳 *Fare Breakdown:*\n• *Total Rental Fare:* ₹{total_amount}\n• *Advance Paid:* ₹{advance_paid}\n• *Balance at Handover:* ₹{balance_amount}\n• *Refundable Security Deposit:* ₹{security_deposit}\n\n📄 *Documents Required at Handover:*\n1. Original Valid Driving License\n2. Aadhaar Card / Original Govt ID\n\n📍 *Office Hub Location:* {google_maps_link}\n📞 *24/7 Helpline:* {helpline_number}\n\nHave a safe and enjoyable drive! 🌿\n*{company_name}* — Junagadh',
  },
  {
    id: 'modern_vehicle_ready',
    title: 'Vehicle Ready & Hub Pickup Notice',
    icon: '🔑',
    category: 'dispatch',
    description: 'Sanitized vehicle ready notice, plate number, hub location link & balance due',
    template:
      'Namaste {customer_name} 🙏\n\nYour self-drive {vehicle_name} is sanitized, inspected, and ready for pickup at Modern Drive! 🚙💨\n\n• *Vehicle:* {vehicle_name}\n• *Plate Number:* {vehicle_number}\n• *Pickup Hub:* {pickup_location}\n• *Pickup Schedule:* {pickup_date} at {pickup_time}\n• *Pending Balance + Deposit:* ₹{balance_amount} + ₹{security_deposit}\n\n⚠️ *Quick Reminder:*\nPlease carry your Original Driving License and take a quick photo of the odometer and fuel level with our executive at vehicle release.\n\n📍 *Google Maps Hub:* {google_maps_link}\n📞 *Hub Desk:* {helpline_number}\n\nDrive safe!\n*{company_name}*',
  },
  {
    id: 'modern_balance_reminder',
    title: 'Rental Balance & Security Deposit Reminder',
    icon: '💰',
    category: 'billing',
    description: 'Payment reminder for remaining rental balance and refundable deposit',
    template:
      'Namaste {customer_name} 🙏\n\nThis is a friendly reminder regarding your upcoming self-drive rental with *{company_name}* ({booking_id}).\n\n• *Vehicle:* {vehicle_name} ({vehicle_number})\n• *Pickup Schedule:* {pickup_date} at {pickup_time}\n• *Pending Balance Fare:* ₹{balance_amount}\n• *Refundable Security Deposit:* ₹{security_deposit}\n\nPlease settle the balance via UPI or upon vehicle handover at our hub for a quick checkout.\n\n📞 *Help / Payment QR:* {helpline_number}\nWarm regards,\n*{company_name}*',
  },
  {
    id: 'modern_doorstep_delivery',
    title: 'Doorstep Vehicle Delivery & Arrival',
    icon: '📍',
    category: 'dispatch',
    description: 'Executive on the way notice, arrival time & handover instructions',
    template:
      'Namaste {customer_name} 🙏\n\nOur delivery executive is on the way with your Modern Drive vehicle! 🚗💨\n\n• *Booking ID:* {booking_id}\n• *Vehicle:* {vehicle_name} ({vehicle_number})\n• *Delivery Address:* {pickup_location}\n• *Expected Time:* {pickup_time} on {pickup_date}\n\nPlease keep your Original Driving License ready for physical verification.\n\n📞 *Executive / Helpline:* {helpline_number}\nWish you a smooth drive!\n*{company_name}*',
  },
  {
    id: 'modern_rental_completed_refund',
    title: 'Rental Completed & Deposit Refund',
    icon: '🏁',
    category: 'billing',
    description: 'Vehicle returned notice, deposit refund status & Google review invitation',
    template:
      'Namaste {customer_name} 🙏\n\nThank you for traveling with *{company_name}*! We hope you had a fantastic driving experience with our {vehicle_name}. 🌟\n\n• *Booking ID:* {booking_id}\n• *Vehicle Returned On:* {dropoff_date}\n• *Security Deposit Status:* ₹{security_deposit} Processed / Refunded\n\n⭐ *Rate Your Drive:*\nIf you enjoyed our clean cars and service, please take 30 seconds to review us on Google:\n{google_maps_link}\n\nWe look forward to hosting you on your next road trip!\nWarm regards,\n*{company_name}*',
  },
  {
    id: 'modern_extension_rsa',
    title: 'Trip Extension & 24/7 Roadside Assistance',
    icon: '🛠️',
    category: 'billing',
    description: 'Booking extension helpline and 24/7 emergency roadside support',
    template:
      'Namaste {customer_name} 🙏\n\nNeed to extend your drive or need any assistance during your journey with *{company_name}*? 🚗🛠️\n\n• *Booking ID:* {booking_id}\n• *Vehicle:* {vehicle_name} ({vehicle_number})\n• *Scheduled Drop-off:* {dropoff_date} at {dropoff_time}\n\n📞 *For Extension or 24/7 Roadside Assistance (RSA):*\nCall: {helpline_number}\n\nDrive safe!\n*{company_name}*',
  },
];

export function getTemplatesForBooking() {
  return MODERN_DRIVE_TEMPLATES;
}

export const MODERN_INSERTABLE_VARIABLES = [
  { tag: '{customer_name}', label: 'Customer Name' },
  { tag: '{booking_id}', label: 'Booking ID' },
  { tag: '{vehicle_name}', label: 'Vehicle Model' },
  { tag: '{vehicle_number}', label: 'Plate Number' },
  { tag: '{pickup_date}', label: 'Pickup Date' },
  { tag: '{pickup_time}', label: 'Pickup Time' },
  { tag: '{dropoff_date}', label: 'Drop-off Date' },
  { tag: '{dropoff_time}', label: 'Drop-off Time' },
  { tag: '{pickup_location}', label: 'Pickup Location / Hub' },
  { tag: '{total_amount}', label: 'Total Fare' },
  { tag: '{advance_paid}', label: 'Advance Paid' },
  { tag: '{balance_amount}', label: 'Balance Due' },
  { tag: '{security_deposit}', label: 'Security Deposit' },
  { tag: '{helpline_number}', label: 'Helpline Number' },
  { tag: '{google_maps_link}', label: 'Google Maps Link' },
  { tag: '{company_name}', label: 'Company Name' },
];

export function getRecommendedTemplateId(booking) {
  const status = (booking?.status || '').toLowerCase();
  const location = (booking?.pickupLocation || booking?.pickup_location || '').toLowerCase();

  if (status.includes('return') || status.includes('complete') || status.includes('refund')) {
    return 'modern_rental_completed_refund';
  }
  if (status.includes('pickup') || status.includes('handover') || status.includes('active')) {
    if (location.includes('doorstep') || location.includes('delivery') || location.includes('home')) {
      return 'modern_doorstep_delivery';
    }
    return 'modern_vehicle_ready';
  }
  if (status.includes('pending') || status.includes('partial')) {
    return 'modern_balance_reminder';
  }
  if (location.includes('doorstep') || location.includes('delivery')) {
    return 'modern_doorstep_delivery';
  }
  return 'modern_booking_confirmation';
}

export function generateWhatsAppDeepLink(phone, text) {
  const clean = sanitizeWhatsAppPhone(phone);
  const encoded = encodeURIComponent(text || '');
  return clean ? `https://wa.me/${clean}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

export default {
  extractBookingDetails,
  renderBookingTemplate,
  getTemplatesForBooking,
  getRecommendedTemplateId,
  generateWhatsAppDeepLink,
  sanitizeWhatsAppPhone,
  isValidWhatsAppPhone,
  formatDisplayPhone,
  MODERN_DRIVE_TEMPLATES,
  MODERN_INSERTABLE_VARIABLES,
};
