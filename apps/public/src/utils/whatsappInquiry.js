/**
 * Customer-Side WhatsApp Inquiry & Payment Verification Utilities
 */

export const DEFAULT_CAR_RENTAL_HOTLINE = '919004460634';
export const DEFAULT_ALT_HOTLINE = '918469265000';
export const DEFAULT_DISPATCH_HOTLINE = '919004460634';

export function sanitizePhone(phone) {
  if (!phone) return '';
  let clean = String(phone).replace(/[^0-9]/g, '');
  if (clean.length === 11 && clean.startsWith('0')) clean = clean.substring(1);
  if (clean.length === 10) clean = `91${clean}`;
  return clean;
}

/**
 * Generate direct click-to-chat inquiry link with pre-formatted inquiry text
 */
export function createWhatsAppInquiryUrl({
  hotlinePhone = DEFAULT_CAR_RENTAL_HOTLINE,
  customerName = '',
  customerPhone = '',
  serviceTitle = 'Self-Drive Car Rental',
  travelDate = '',
  notes = '',
}) {
  const cleanHotline = sanitizePhone(hotlinePhone) || DEFAULT_CAR_RENTAL_HOTLINE;

  const text =
    `*NEW INQUIRY*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Name:* ${customerName || 'Interested Customer'}\n` +
    `📞 *Phone:* ${customerPhone || 'Not Provided'}\n` +
    `🧭 *Service / Vehicle:* ${serviceTitle}\n` +
    `📅 *Preferred Date:* ${travelDate || 'Flexible'}\n` +
    `📝 *Notes:* ${notes || 'Please provide details & best quote.'}\n` +
    `━━━━━━━━━━━━━━━━━━━━`;

  return `https://wa.me/${cleanHotline}?text=${encodeURIComponent(text)}`;
}

/**
 * Allow customers to directly dispatch UPI payment proof to the dispatch & accounts desk
 */
export function createPaymentProofWhatsAppUrl({
  accountPhone = DEFAULT_DISPATCH_HOTLINE,
  bookingCode = '',
  customerName = '',
  customerPhone = '',
  amountPaid = 0,
  utrNumber = '',
}) {
  const cleanAccount = sanitizePhone(accountPhone) || DEFAULT_DISPATCH_HOTLINE;

  const text =
    `*ADVANCE PAYMENT PROOF SUBMISSION*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🔖 *Booking Reference:* ${bookingCode}\n` +
    `👤 *Customer:* ${customerName} (${customerPhone})\n` +
    `💰 *Deposit Paid:* ₹${Number(amountPaid).toLocaleString('en-IN')}\n` +
    `🔢 *UTR / Ref Number:* ${utrNumber || 'Attached Below'}\n\n` +
    `_I have completed the transfer. Please find the attached screenshot for verification._`;

  return `https://wa.me/${cleanAccount}?text=${encodeURIComponent(text)}`;
}
