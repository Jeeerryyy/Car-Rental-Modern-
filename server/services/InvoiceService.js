/**
 * Invoice Service - PDF invoice generation for completed bookings
 * @module services/InvoiceService
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF invoice for a booking
 * @param {Object} booking - Booking document
 * @param {Object} user - User document
 * @param {Object} car - Car document
 * @returns {Promise<string>} Path to generated PDF
 */
const generateInvoice = async (booking, user, car) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const dir = path.join(__dirname, '../temp');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);

      const filePath = path.join(dir, `Invoice-${booking.confirmationNumber}.pdf`);
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.fontSize(20).font('Helvetica-Bold').text('Modern Selfdrive', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Junagadh, Gujarat, India', { align: 'center' });
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      doc.fontSize(14).font('Helvetica-Bold').text('Booking Invoice', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica');
      doc.text(`Invoice No: INV-${booking.confirmationNumber}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      doc.font('Helvetica-Bold').text('Billed To:');
      doc.font('Helvetica').text(`Name: ${user.name}`);
      doc.text(`Email: ${user.email}`);
      if (user.phone) doc.text(`Phone: ${user.phone}`);
      doc.moveDown();

      doc.font('Helvetica-Bold').text('Vehicle Details:');
      doc.font('Helvetica').text(`Car: ${car.make} ${car.model} (${car.year})`);
      doc.text(`License Plate: ${car.licensePlate}`);
      doc.moveDown();

      doc.font('Helvetica-Bold').text('Rental Period:');
      doc.font('Helvetica').text(`Pick-up: ${new Date(booking.pickupDate).toLocaleString()}`);
      doc.text(`Drop-off: ${new Date(booking.dropoffDate).toLocaleString()}`);
      doc.text(`Pick-up Location: ${booking.pickupLocation}`);
      doc.text(`Drop-off Location: ${booking.dropoffLocation}`);
      doc.moveDown();

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      doc.font('Helvetica-Bold').text('Charges breakdown:', { underline: true });
      doc.moveDown(0.5);
      doc.font('Helvetica');
      doc.text(`Base Price: Rs. ${booking.basePrice}`);

      if (booking.driverRequired) doc.text(`Driver Charge: Rs. 500/day`);
      if (booking.discountAmount > 0) doc.text(`Discount (Promo: ${booking.promoCode || 'Applied'}): -Rs. ${booking.discountAmount}`);
      if (booking.securityDeposit > 0) doc.text(`Security Deposit (Refundable): Rs. ${booking.securityDeposit}`);
      if (booking.fuelOverageCharge > 0) doc.text(`Fuel Overage Charge: Rs. ${booking.fuelOverageCharge}`);
      if (booking.lateReturnPenalty > 0) doc.text(`Late Return Penalty: Rs. ${booking.lateReturnPenalty}`);
      if (booking.tollCharges > 0) doc.text(`Toll Charges: Rs. ${booking.tollCharges}`);

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      doc.fontSize(12).font('Helvetica-Bold').text(`Total Amount: Rs. ${booking.finalBilledAmount || booking.totalPrice}`);
      doc.fontSize(10).font('Helvetica').text(`Payment Method: ${booking.paymentMethod}`);
      doc.moveDown(2);
      doc.text('Thank you for choosing Modern Selfdrive!', { align: 'center', oblique: true });

      doc.end();
      stream.on('finish', () => resolve(filePath));
      stream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateInvoice };
