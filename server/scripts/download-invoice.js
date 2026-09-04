/**
 * ============================================================
 *  Modern Drive — Download Invoice PDF for a specific Customer
 * ============================================================
 *  READ-ONLY — no database writes.
 *
 *  Usage:
 *    npx tsx scripts/download-invoice.js "hitu hitu"
 *
 *  Output:
 *    server/Invoice_<CustomerName>_<RefId>.html  (for each booking)
 * ============================================================
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// ── Import Models ───────────────────────────────────────────
import Booking  from '../src/models/Booking.js';
import Customer from '../src/models/Customer.js';
import '../src/models/Car.js';
import '../src/models/Owner.js';

// ── Import Invoice Service ──────────────────────────────────
import { generateInvoiceHTML, formatCurrency, formatDate } from '../src/services/invoiceTemplate.js';

// ── Main ─────────────────────────────────────────────────────
const run = async () => {
  const customerName = process.argv[2] || 'hitu hitu';

  console.log(`🔌  Connecting to MongoDB (read-only)…`);
  await mongoose.connect(process.env.MONGO_URI, {
    readPreference: 'secondaryPreferred',
  });
  console.log(`✅  Connected!\n`);

  // ── Find Customer ─────────────────────────────────────────
  const customer = await Customer.findOne({
    name: { $regex: new RegExp(`^${customerName}$`, 'i') }
  }).lean();

  if (!customer) {
    console.error(`❌  Customer "${customerName}" not found in the database.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`👤  Found customer: ${customer.name} (${customer.email})`);

  // ── Find All Bookings for This Customer ───────────────────
  const bookings = await Booking.find({ customer: customer._id })
    .populate('car', 'type make model images pricePerDay category fuelType transmission year registrationNumber color')
    .populate('customer', 'name email phone address drivingLicenceNumber aadhaarNumber documents')
    .sort({ createdAt: -1 })
    .lean();

  if (bookings.length === 0) {
    console.log(`⚠️  No bookings found for customer "${customer.name}".`);
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log(`📦  Found ${bookings.length} booking(s) for ${customer.name}\n`);

  // ── Generate Invoice for Each Booking ─────────────────────
  const outputDir = path.join(__dirname, '..', 'invoices');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const booking of bookings) {
    const car = booking.car || {};
    const cust = booking.customer || customer;

    // Determine KM limit based on type
    const isBike = car.type === 'bike' || ['bike', 'scooter', 'cruiser', 'sportsbike'].includes(car.category?.toLowerCase());
    const kmLimit = isBike ? 50 : 300;

    // Calculate totals
    const totalDays = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24)) || 1;
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

    const invoiceData = {
      invoiceNumber: booking.invoiceNumber || '—',
      invoiceDate: booking.invoiceDate || booking.createdAt,
      pickupDate: booking.startDate,
      returnDate: booking.endDate,
      customerName: cust.name,
      customerPhone: cust.phone || booking.phone || '—',
      customerEmail: cust.email,
      drivingLicenceNumber: cust.drivingLicenceNumber || '—',
      aadhaarNumber: cust.aadhaarNumber || '—',
      customerAddress: cust.address || '—',
      vehicleName: car.make ? `${car.make} ${car.model}` : 'N/A',
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
      aadhaarFront: booking.documents?.aadhaar?.front?.url || cust?.documents?.aadhaar?.front?.url || '',
      aadhaarBack: booking.documents?.aadhaar?.back?.url || cust?.documents?.aadhaar?.back?.url || '',
      licenseFront: booking.documents?.license?.front?.url || cust?.documents?.license?.front?.url || '',
      licenseBack: booking.documents?.license?.back?.url || cust?.documents?.license?.back?.url || '',
      bookingId: booking._id,
      bookingStatus: booking.status,
      paymentStatus: booking.paymentStatus,
      referenceId: booking.referenceId,
    };

    // Generate HTML
    const html = generateInvoiceHTML(invoiceData);

    // Write HTML file
    const safeName = customer.name.replace(/[^a-zA-Z0-9]/g, '_');
    const refId = booking.referenceId || booking._id.toString().slice(-8);
    const fileName = `Invoice_${safeName}_${refId}.html`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅  Invoice saved: ${filePath}`);
    console.log(`    📋  Ref: ${refId} | Vehicle: ${invoiceData.vehicleName} | Amount: ₹${formatCurrency(invoiceData.totalPayable)} | Status: ${booking.status}`);
  }

  console.log(`\n📂  All invoices saved to: ${outputDir}`);
  console.log(`💡  Open any .html file in your browser and press Ctrl+P to print/save as PDF.`);

  await mongoose.disconnect();
  console.log('🔌  Disconnected from MongoDB.');
  process.exit(0);
};

run().catch((err) => {
  console.error('❌  Error:', err);
  mongoose.disconnect().then(() => process.exit(1));
});
