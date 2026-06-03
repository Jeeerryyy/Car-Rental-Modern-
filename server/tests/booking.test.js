/**
 * ============================================================
 * BOOKING FLOW TESTS — Priority 2 (Core Business Logic)
 * ============================================================
 * Tests booking creation, availability checks, price calculation,
 * owner actions (confirm/reject), customer cancellation, and
 * state machine transitions.
 */
import { jest } from '@jest/globals';

// ── Mock external services ──
jest.unstable_mockModule('../src/config/socket.js', () => ({
  initSocket: jest.fn(),
  getIO: jest.fn(() => ({
    to: jest.fn(() => ({ emit: jest.fn() })),
  })),
}));

jest.unstable_mockModule('../src/config/razorpay.js', () => ({
  default: { orders: { create: jest.fn() } },
}));

jest.unstable_mockModule('../src/services/cloudinary.service.js', () => ({
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
  deleteMultipleImages: jest.fn(),
  uploadCarImages: jest.fn(),
  uploadProfileImage: jest.fn(),
  uploadDocument: jest.fn(),
}));

jest.unstable_mockModule('../src/config/email.js', () => ({
  default: null,
}));

jest.unstable_mockModule('../src/jobs/bookingReminder.js', () => ({
  initBookingReminders: jest.fn(),
}));

jest.unstable_mockModule('../src/jobs/backupJob.js', () => ({
  initBackupJob: jest.fn(),
}));

// ── Dynamic imports ──
const { default: supertest } = await import('supertest');
const { connectTestDB, disconnectTestDB, clearTestDB } = await import('./setup/db.js');
const { default: app } = await import('./setup/app.js');
const {
  createTestCustomer, createTestOwner, createTestCar, createTestBooking,
} = await import('./setup/helpers.js');
const { default: Booking } = await import('../src/models/Booking.js');

const request = supertest(app);

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await disconnectTestDB(); });
beforeEach(async () => { await clearTestDB(); });

// ═══════════════════════════════════════════════════════════════
// BOOKING CREATION
// ═══════════════════════════════════════════════════════════════
describe('Booking Creation (POST /api/bookings)', () => {

  it('should create a booking for an available car', async () => {
    const { owner } = await createTestOwner();
    const { cookie: custCookie, customer } = await createTestCustomer();
    const car = await createTestCar(owner._id);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 3);

    const res = await request
      .post('/api/bookings')
      .set('Cookie', custCookie)
      .send({
        carId: car._id.toString(),
        startDate: tomorrow.toISOString(),
        endDate: dayAfter.toISOString(),
        phone: '9876543210',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.booking).toBeDefined();
    expect(res.body.data.booking.status).toBe('pending');

    // Verify booking exists in DB
    const dbBooking = await Booking.findById(res.body.data.booking._id);
    expect(dbBooking).not.toBeNull();
    expect(dbBooking.customer.toString()).toBe(customer._id.toString());
  });

  it('should reject booking for a deleted (unavailable) car', async () => {
    const { owner } = await createTestOwner();
    const { cookie: custCookie } = await createTestCustomer();
    const car = await createTestCar(owner._id, { isDeleted: true, isActive: false });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 3);

    const res = await request
      .post('/api/bookings')
      .set('Cookie', custCookie)
      .send({
        carId: car._id.toString(),
        startDate: tomorrow.toISOString(),
        endDate: dayAfter.toISOString(),
        phone: '9876543210',
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should reject booking when dates conflict with existing booking', async () => {
    const { owner } = await createTestOwner();
    const { cookie: custCookie, customer } = await createTestCustomer();
    const car = await createTestCar(owner._id);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 3);

    // Create an existing booking
    await createTestBooking(customer._id, owner._id, car._id, {
      startDate: tomorrow,
      endDate: dayAfter,
      status: 'confirmed',
    });

    // Try to book overlapping dates
    const res = await request
      .post('/api/bookings')
      .set('Cookie', custCookie)
      .send({
        carId: car._id.toString(),
        startDate: tomorrow.toISOString(),
        endDate: dayAfter.toISOString(),
        phone: '9876543210',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should calculate totalPrice correctly (days × pricePerDay)', async () => {
    const { owner } = await createTestOwner();
    const { cookie: custCookie } = await createTestCustomer();
    const car = await createTestCar(owner._id, { pricePerDay: 500 });

    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 5); // 5 days

    const res = await request
      .post('/api/bookings')
      .set('Cookie', custCookie)
      .send({
        carId: car._id.toString(),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        phone: '9876543210',
      });

    expect(res.status).toBe(201);
    // 5 days × ₹500 = ₹2500
    expect(res.body.data.booking.totalPrice).toBe(2500);
  });
});

// ═══════════════════════════════════════════════════════════════
// OWNER BOOKING MANAGEMENT
// ═══════════════════════════════════════════════════════════════
describe('Owner Booking Status (PUT /api/owner/bookings/:id/status)', () => {

  it('should allow owner to confirm a pending booking', async () => {
    const { owner, cookie: ownerCookie } = await createTestOwner();
    const { customer } = await createTestCustomer();
    const car = await createTestCar(owner._id);
    const booking = await createTestBooking(customer._id, owner._id, car._id);

    const res = await request
      .put(`/api/owner/bookings/${booking._id}/status`)
      .set('Cookie', ownerCookie)
      .send({ status: 'confirmed' });

    expect(res.status).toBe(200);
    expect(res.body.data.booking.status).toBe('confirmed');
  });

  it('should allow owner to cancel a pending booking', async () => {
    const { owner, cookie: ownerCookie } = await createTestOwner();
    const { customer } = await createTestCustomer();
    const car = await createTestCar(owner._id);
    const booking = await createTestBooking(customer._id, owner._id, car._id);

    const res = await request
      .put(`/api/owner/bookings/${booking._id}/status`)
      .set('Cookie', ownerCookie)
      .send({ status: 'cancelled' });

    expect(res.status).toBe(200);
    expect(res.body.data.booking.status).toBe('cancelled');
  });

  it('should reject invalid status transitions (pending → completed)', async () => {
    const { owner, cookie: ownerCookie } = await createTestOwner();
    const { customer } = await createTestCustomer();
    const car = await createTestCar(owner._id);
    const booking = await createTestBooking(customer._id, owner._id, car._id);

    const res = await request
      .put(`/api/owner/bookings/${booking._id}/status`)
      .set('Cookie', ownerCookie)
      .send({ status: 'completed' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject status change by non-owning owner', async () => {
    const { owner: owner1 } = await createTestOwner();
    const { cookie: owner2Cookie } = await createTestOwner();
    const { customer } = await createTestCustomer();
    const car = await createTestCar(owner1._id);
    const booking = await createTestBooking(customer._id, owner1._id, car._id);

    const res = await request
      .put(`/api/owner/bookings/${booking._id}/status`)
      .set('Cookie', owner2Cookie)
      .send({ status: 'confirmed' });

    expect(res.status).toBe(404);
  });
});

// ═══════════════════════════════════════════════════════════════
// CUSTOMER CANCELLATION
// ═══════════════════════════════════════════════════════════════
describe('Customer Cancellation (PUT /api/bookings/:id/cancel)', () => {

  it('should allow customer to cancel their own booking', async () => {
    const { owner } = await createTestOwner();
    const { customer, cookie: custCookie } = await createTestCustomer();
    const car = await createTestCar(owner._id);
    const booking = await createTestBooking(customer._id, owner._id, car._id);

    const res = await request
      .put(`/api/bookings/${booking._id}/cancel`)
      .set('Cookie', custCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.booking.status).toBe('cancelled');

    // Verify DB
    const dbBooking = await Booking.findById(booking._id);
    expect(dbBooking.status).toBe('cancelled');
  });

  it('should prevent customer from cancelling another customer\'s booking', async () => {
    const { owner } = await createTestOwner();
    const { customer: cust1 } = await createTestCustomer();
    const { cookie: cust2Cookie } = await createTestCustomer();
    const car = await createTestCar(owner._id);
    const booking = await createTestBooking(cust1._id, owner._id, car._id);

    const res = await request
      .put(`/api/bookings/${booking._id}/cancel`)
      .set('Cookie', cust2Cookie);

    // Service returns 404 ("Booking not found" — cust2 doesn't own it)
    expect(res.status).toBe(404);
  });

  it('should reject cancellation of an active booking', async () => {
    const { owner } = await createTestOwner();
    const { customer, cookie: custCookie } = await createTestCustomer();
    const car = await createTestCar(owner._id);
    const booking = await createTestBooking(customer._id, owner._id, car._id, {
      status: 'active',
    });

    const res = await request
      .put(`/api/bookings/${booking._id}/cancel`)
      .set('Cookie', custCookie);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// OWNER BOOKING DELETION
// ═══════════════════════════════════════════════════════════════
describe('Owner Booking Deletion (DELETE /api/owner/bookings/:id)', () => {

  it('should allow owner to delete their own booking', async () => {
    const { owner, cookie: ownerCookie } = await createTestOwner();
    const { customer } = await createTestCustomer();
    const car = await createTestCar(owner._id);
    const booking = await createTestBooking(customer._id, owner._id, car._id);

    const res = await request
      .delete(`/api/owner/bookings/${booking._id}`)
      .set('Cookie', ownerCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('deleted');

    // Verify booking is deleted from DB
    const dbBooking = await Booking.findById(booking._id);
    expect(dbBooking).toBeNull();
  });

  it('should reject booking deletion by non-owning owner', async () => {
    const { owner: owner1 } = await createTestOwner();
    const { cookie: owner2Cookie } = await createTestOwner();
    const { customer } = await createTestCustomer();
    const car = await createTestCar(owner1._id);
    const booking = await createTestBooking(customer._id, owner1._id, car._id);

    const res = await request
      .delete(`/api/owner/bookings/${booking._id}`)
      .set('Cookie', owner2Cookie);

    expect(res.status).toBe(404);
    
    // Verify booking still exists in DB
    const dbBooking = await Booking.findById(booking._id);
    expect(dbBooking).not.toBeNull();
  });

  it('should reject deletion for unauthenticated users', async () => {
    const { owner } = await createTestOwner();
    const { customer } = await createTestCustomer();
    const car = await createTestCar(owner._id);
    const booking = await createTestBooking(customer._id, owner._id, car._id);

    const res = await request
      .delete(`/api/owner/bookings/${booking._id}`);

    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════
// INVOICE AND SECURITY DEPOSIT CALCULATIONS
// ═══════════════════════════════════════════════════════════════
describe('Invoice and Security Deposit Calculations', () => {
  it('should deduct paid security deposit from total rent for remaining payable amount', async () => {
    const { owner } = await createTestOwner();
    const { customer } = await createTestCustomer();
    const car = await createTestCar(owner._id, { pricePerDay: 1000 });
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 2); // 2 days

    const booking = await createTestBooking(customer._id, owner._id, car._id, {
      startDate: tomorrow,
      endDate: dayAfter,
      totalPrice: 2000,
      securityDeposit: 500,
      amountPaid: 500,
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    const { getInvoiceData } = await import('../src/services/invoice.service.js');
    const invoiceData = await getInvoiceData(booking._id, owner._id);

    expect(invoiceData.totalPayable).toBe(2000);
    expect(invoiceData.amountDue).toBe(1500);
  });

  it('should include security deposit in remaining payable if not paid yet', async () => {
    const { owner } = await createTestOwner();
    const { customer } = await createTestCustomer();
    const car = await createTestCar(owner._id, { pricePerDay: 1000 });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 2); // 2 days

    const booking = await createTestBooking(customer._id, owner._id, car._id, {
      startDate: tomorrow,
      endDate: dayAfter,
      totalPrice: 2000,
      securityDeposit: 500,
      amountPaid: 0,
      status: 'confirmed',
      paymentStatus: 'pending'
    });

    const { getInvoiceData } = await import('../src/services/invoice.service.js');
    const invoiceData = await getInvoiceData(booking._id, owner._id);

    expect(invoiceData.totalPayable).toBe(2500);
    expect(invoiceData.amountDue).toBe(2500);
  });

  it('should populate and return the customer\'s Aadhaar number on getInvoiceData', async () => {
    const { owner } = await createTestOwner();
    const { customer } = await createTestCustomer({
      aadhaarNumber: '123456789012'
    });
    const car = await createTestCar(owner._id);
    const booking = await createTestBooking(customer._id, owner._id, car._id, {
      status: 'confirmed'
    });

    const { getInvoiceData } = await import('../src/services/invoice.service.js');
    const invoiceData = await getInvoiceData(booking._id, owner._id);

    expect(invoiceData.aadhaarNumber).toBe('123456789012');
  });
});

