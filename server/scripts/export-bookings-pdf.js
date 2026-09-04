/**
 * ============================================================
 *  Modern Drive — Export ALL Bookings to PDF (READ-ONLY)
 * ============================================================
 *  This script connects to MongoDB, reads every booking with
 *  customer & car details, and writes a professional PDF.
 *
 *  ⚠️  No database writes — purely a SELECT/find operation.
 *
 *  Usage:
 *    npx tsx scripts/export-bookings-pdf.js
 *
 *  Output:
 *    server/Modern_Drive_Bookings_Backup_<date>.pdf
 * ============================================================
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

// ── Paths ────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// ── Import Models (registers Mongoose schemas) ──────────────
import Booking  from '../src/models/Booking.js';
import '../src/models/Customer.js';   // registers 'Customer' schema
import '../src/models/Car.js';        // registers 'Car' schema
import '../src/models/Owner.js';      // registers 'Owner'  schema

// ── Helpers ──────────────────────────────────────────────────
const fmt = (d) => {
  if (!d) return 'N/A';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

const fmtDateTime = (d) => {
  if (!d) return 'N/A';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

const rupees = (n) => {
  if (n == null) return '₹0';
  return `Rs.${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
};

const safe = (v) => (v != null && v !== '' ? String(v) : 'N/A');

// ── Main ─────────────────────────────────────────────────────
const run = async () => {
  console.log('🔌  Connecting to MongoDB (read-only)…');
  await mongoose.connect(process.env.MONGO_URI, {
    readPreference: 'secondaryPreferred',   // hint: prefer secondaries
  });
  console.log('✅  Connected!\n');

  // Fetch every booking, populate customer + car + owner
  const bookings = await Booking.find({})
    .populate('customer', 'name email phone address drivingLicenceNumber aadhaarNumber')
    .populate('car',      'make model year registrationNumber category fuelType transmission color pricePerDay location type')
    .populate('owner',    'name email phone')
    .sort({ createdAt: -1 })
    .lean();

  console.log(`📦  Found ${bookings.length} bookings. Generating PDF…\n`);

  if (bookings.length === 0) {
    console.log('⚠️  No bookings found in the database. Nothing to export.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // ── PDF Setup ────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
  const pdfPath = path.join(__dirname, '..', `Modern_Drive_Bookings_Backup_${today}.pdf`);
  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  // ── Colors ───────────────────────────────────────────────
  const BRAND      = '#1a237e';   // dark indigo
  const HEADER_BG  = '#e8eaf6';
  const ACCENT     = '#283593';
  const LIGHT_GRAY = '#f5f5f5';
  const BORDER     = '#bdbdbd';
  const GREEN      = '#2e7d32';
  const RED        = '#c62828';
  const ORANGE     = '#ef6c00';
  const BLUE       = '#1565c0';

  // ── Cover Page ───────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1a237e');
  doc.fill('#ffffff');

  doc.fontSize(36).font('Helvetica-Bold')
     .text('MODERN DRIVE', 0, 200, { align: 'center' });
  doc.fontSize(16).font('Helvetica')
     .text('Self Drive Car Rental', 0, 250, { align: 'center' });
  doc.moveDown(3);
  doc.fontSize(22).font('Helvetica-Bold')
     .text('BOOKINGS BACKUP REPORT', 0, 320, { align: 'center' });
  doc.moveDown(1);
  doc.fontSize(12).font('Helvetica')
     .text(`Generated on: ${fmtDateTime(new Date())}`, 0, 370, { align: 'center' });
  doc.text(`Total Bookings: ${bookings.length}`, 0, 390, { align: 'center' });

  // Stats
  const stats = {
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    active:    bookings.filter(b => b.status === 'active').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };
  const totalRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((s, b) => s + (b.totalPrice || 0), 0);

  doc.moveDown(2);
  doc.fontSize(11)
     .text(`Pending: ${stats.pending}  |  Confirmed: ${stats.confirmed}  |  Active: ${stats.active}  |  Completed: ${stats.completed}  |  Cancelled: ${stats.cancelled}`, 0, 440, { align: 'center' });
  doc.text(`Total Revenue (excl. cancelled): ${rupees(totalRevenue)}`, 0, 460, { align: 'center' });

  doc.fill('#000000');

  // ── Booking Pages ────────────────────────────────────────
  const statusColor = (s) => {
    switch (s) {
      case 'confirmed': case 'active': case 'completed': return GREEN;
      case 'cancelled': return RED;
      case 'pending': return ORANGE;
      default: return '#000000';
    }
  };

  const paymentColor = (s) => {
    switch (s) {
      case 'paid': return GREEN;
      case 'refunded': return RED;
      case 'pay_at_car': return BLUE;
      case 'pending': return ORANGE;
      default: return '#000000';
    }
  };

  const drawSectionHeader = (label, y) => {
    doc.rect(40, y, doc.page.width - 80, 20).fill(HEADER_BG).stroke(BORDER);
    doc.fill(ACCENT).fontSize(10).font('Helvetica-Bold')
       .text(label, 48, y + 5, { width: doc.page.width - 96 });
    doc.fill('#000000');
    return y + 24;
  };

  const drawRow = (label, value, y, opts = {}) => {
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = 50;
    }
    doc.font('Helvetica-Bold').fontSize(9).fill('#555555')
       .text(label, 50, y, { width: 150 });
    doc.font('Helvetica').fontSize(9).fill(opts.color || '#000000')
       .text(safe(value), 200, y, { width: doc.page.width - 250 });
    doc.fill('#000000');
    return y + 16;
  };

  bookings.forEach((b, idx) => {
    doc.addPage();

    const customer = b.customer || {};
    const car      = b.car || {};
    const owner    = b.owner || {};

    // ── Booking Header ──────────────────────────────────
    doc.rect(40, 40, doc.page.width - 80, 50).fill(BRAND);
    doc.fill('#ffffff').font('Helvetica-Bold').fontSize(14)
       .text(`Booking #${idx + 1}`, 50, 50);
    doc.fontSize(10).font('Helvetica')
       .text(`Ref: ${safe(b.referenceId)}`, 50, 70);
    doc.font('Helvetica-Bold').fontSize(11)
       .text(safe(customer.name || 'Unknown Customer'), doc.page.width - 250, 55, { width: 200, align: 'right' });

    doc.fill('#000000');
    let y = 100;

    // ── Customer Details ────────────────────────────────
    y = drawSectionHeader('CUSTOMER DETAILS', y);
    y = drawRow('Name',              customer.name, y);
    y = drawRow('Email',             customer.email, y);
    y = drawRow('Phone',             b.phone || customer.phone, y);
    y = drawRow('Address',           customer.address, y);
    y = drawRow('Driving Licence',   customer.drivingLicenceNumber, y);
    y = drawRow('Aadhaar',           customer.aadhaarNumber, y);
    y += 6;

    // ── Vehicle Details ─────────────────────────────────
    y = drawSectionHeader('VEHICLE DETAILS', y);
    const vehicleName = car.make ? `${car.make} ${car.model} (${car.year || ''})` : 'N/A';
    y = drawRow('Vehicle',           vehicleName, y);
    y = drawRow('Type',              car.type, y);
    y = drawRow('Category',          car.category, y);
    y = drawRow('Reg. Number',       car.registrationNumber, y);
    y = drawRow('Fuel / Trans.',     `${safe(car.fuelType)} / ${safe(car.transmission)}`, y);
    y = drawRow('Color',             car.color, y);
    y = drawRow('Price/Day',         rupees(car.pricePerDay), y);
    y = drawRow('Location',          car.location, y);
    y += 6;

    // ── Booking Details ─────────────────────────────────
    y = drawSectionHeader('BOOKING DETAILS', y);
    y = drawRow('Reference ID',      b.referenceId, y);
    y = drawRow('Status',            (b.status || '').toUpperCase(), y, { color: statusColor(b.status) });
    y = drawRow('Payment Status',    (b.paymentStatus || '').toUpperCase(), y, { color: paymentColor(b.paymentStatus) });
    y = drawRow('Start Date',        fmt(b.startDate), y);
    y = drawRow('End Date',          fmt(b.endDate), y);

    const days = b.startDate && b.endDate
      ? Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60 * 60 * 24)) || 1
      : 'N/A';
    y = drawRow('Total Days',        days, y);
    y = drawRow('Total Price',       rupees(b.totalPrice), y);
    y = drawRow('Discount',          rupees(b.discountAmount), y);
    y = drawRow('Promo Code',        b.promoCode, y);
    y = drawRow('Security Deposit',  rupees(b.securityDeposit), y);
    y = drawRow('Amount Paid',       rupees(b.amountPaid), y);
    y = drawRow('Invoice #',         b.invoiceNumber, y);
    y = drawRow('Invoice Date',      fmt(b.invoiceDate), y);
    y += 6;

    // ── Payment Info ────────────────────────────────────
    if (b.razorpayOrderId || b.razorpayPaymentId) {
      y = drawSectionHeader('PAYMENT INFO', y);
      y = drawRow('Razorpay Order ID',   b.razorpayOrderId, y);
      y = drawRow('Razorpay Payment ID', b.razorpayPaymentId, y);
      y += 6;
    }

    // ── Owner Details ───────────────────────────────────
    y = drawSectionHeader('OWNER DETAILS', y);
    y = drawRow('Owner Name',  owner.name, y);
    y = drawRow('Owner Email', owner.email, y);
    y = drawRow('Owner Phone', owner.phone, y);
    y += 6;

    // ── Cancellation (if any) ───────────────────────────
    if (b.status === 'cancelled') {
      y = drawSectionHeader('CANCELLATION', y);
      y = drawRow('Reason',       b.cancellationReason, y, { color: RED });
      y = drawRow('Note',         b.cancellationNote, y);
      y = drawRow('Cancelled By', b.cancelledBy, y);
      y += 6;
    }

    // ── Notes ───────────────────────────────────────────
    if (b.notes) {
      y = drawSectionHeader('NOTES', y);
      y = drawRow('Notes', b.notes, y);
      y += 6;
    }

    // ── Timestamps ──────────────────────────────────────
    y = drawSectionHeader('TIMESTAMPS', y);
    y = drawRow('Created At', fmtDateTime(b.createdAt), y);
    y = drawRow('Updated At', fmtDateTime(b.updatedAt), y);

    // ── Footer line ─────────────────────────────────────
    doc.moveTo(40, doc.page.height - 30)
       .lineTo(doc.page.width - 40, doc.page.height - 30)
       .strokeColor(BORDER).stroke();
    doc.fill('#999999').fontSize(7).font('Helvetica')
       .text(`Modern Drive • Bookings Backup • Page ${idx + 2}`, 40, doc.page.height - 25, {
         width: doc.page.width - 80, align: 'center'
       });
  });

  // ── Summary Table Page ───────────────────────────────────
  doc.addPage();
  doc.rect(40, 40, doc.page.width - 80, 30).fill(BRAND);
  doc.fill('#ffffff').font('Helvetica-Bold').fontSize(14)
     .text('BOOKING SUMMARY TABLE', 50, 48);
  doc.fill('#000000');

  // Table header
  const colX  = [40, 100, 200, 290, 350, 420, 490];
  const colW  = [60, 100, 90,  60,  70,  70,  65];
  const heads = ['#', 'Customer', 'Vehicle', 'Days', 'Amount', 'Status', 'Payment'];
  let ty = 80;

  doc.rect(40, ty, doc.page.width - 80, 18).fill(HEADER_BG);
  heads.forEach((h, i) => {
    doc.fill(ACCENT).font('Helvetica-Bold').fontSize(8)
       .text(h, colX[i] + 4, ty + 4, { width: colW[i] });
  });
  doc.fill('#000000');
  ty += 20;

  bookings.forEach((b, idx) => {
    if (ty > doc.page.height - 50) {
      doc.addPage();
      ty = 50;
      doc.rect(40, ty, doc.page.width - 80, 18).fill(HEADER_BG);
      heads.forEach((h, i) => {
        doc.fill(ACCENT).font('Helvetica-Bold').fontSize(8)
           .text(h, colX[i] + 4, ty + 4, { width: colW[i] });
      });
      doc.fill('#000000');
      ty += 20;
    }

    if (idx % 2 === 0) {
      doc.rect(40, ty, doc.page.width - 80, 16).fill(LIGHT_GRAY);
    }

    const cust = b.customer || {};
    const car  = b.car || {};
    const days = b.startDate && b.endDate
      ? Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60 * 60 * 24)) || 1
      : '-';

    const row = [
      String(idx + 1),
      safe(cust.name).substring(0, 18),
      car.make ? `${car.make} ${car.model}`.substring(0, 16) : 'N/A',
      String(days),
      rupees(b.totalPrice),
      (b.status || '').toUpperCase(),
      (b.paymentStatus || '').toUpperCase()
    ];

    row.forEach((cell, i) => {
      let color = '#000000';
      if (i === 5) color = statusColor(b.status);
      if (i === 6) color = paymentColor(b.paymentStatus);
      doc.fill(color).font('Helvetica').fontSize(7)
         .text(cell, colX[i] + 4, ty + 4, { width: colW[i] });
    });
    doc.fill('#000000');
    ty += 16;
  });

  // ── Finalize ─────────────────────────────────────────────
  doc.end();

  await new Promise((resolve) => stream.on('finish', resolve));

  console.log(`✅  PDF generated successfully!`);
  console.log(`📄  File: ${pdfPath}`);
  console.log(`📊  Total bookings exported: ${bookings.length}`);

  await mongoose.disconnect();
  console.log('🔌  Disconnected from MongoDB.');
  process.exit(0);
};

run().catch((err) => {
  console.error('❌  Error:', err);
  mongoose.disconnect().then(() => process.exit(1));
});
