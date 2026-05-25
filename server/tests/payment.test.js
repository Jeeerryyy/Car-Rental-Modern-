/**
 * ============================================================
 * PAYMENT & WEBHOOK TESTS — Priority 3
 * ============================================================
 * Tests Razorpay webhook signature verification, booking status
 * updates on payment capture, and tampered payload rejection.
 */
import { jest } from '@jest/globals';
import crypto from 'crypto';

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
const { createTestOwner, createTestCustomer, createTestCar, createTestBooking } = await import('./setup/helpers.js');
const { default: Booking } = await import('../src/models/Booking.js');
const { config } = await import('../src/config/env.js');

const request = supertest(app);

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await disconnectTestDB(); });
beforeEach(async () => { await clearTestDB(); });

/**
 * Generate a valid HMAC signature for webhook payloads
 */
const generateValidSignature = (payload) => {
  return crypto
    .createHmac('sha256', config.payment.secret || 'test_secret')
    .update(JSON.stringify(payload))
    .digest('hex');
};

// ═══════════════════════════════════════════════════════════════
// WEBHOOK TESTS
// ═══════════════════════════════════════════════════════════════
describe('Razorpay Webhook (POST /api/webhooks/razorpay)', () => {

  it('should process webhook with valid signature (200)', async () => {
    const { owner } = await createTestOwner();
    const { customer } = await createTestCustomer();
    const car = await createTestCar(owner._id);
    const booking = await createTestBooking(customer._id, owner._id, car._id, {
      razorpayOrderId: 'order_test_123',
    });

    const payload = {
      event: 'payment.captured',
      payload: {
        payload: {
          payment: {
            entity: {
              order_id: 'order_test_123',
            },
          },
        },
      },
    };

    // If PAYMENT_ENABLED is false, verifyWebhookSignature auto-returns true
    const res = await request
      .post('/api/webhooks/razorpay')
      .set('x-razorpay-signature', generateValidSignature(payload))
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify booking was updated in DB
    const updatedBooking = await Booking.findById(booking._id);
    expect(updatedBooking.paymentStatus).toBe('paid');
    expect(updatedBooking.status).toBe('confirmed');
  });

  it('should reject webhook with invalid/missing signature (400)', async () => {
    // Force payment enabled so signature verification is enforced
    const originalEnabled = config.payment.enabled;
    config.payment.enabled = true;

    const payload = {
      event: 'payment.captured',
      payload: { payload: { payment: { entity: { order_id: 'order_fake' } } } },
    };

    const res = await request
      .post('/api/webhooks/razorpay')
      .set('x-razorpay-signature', 'totally-fake-signature')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);

    // Restore
    config.payment.enabled = originalEnabled;
  });

  it('should not update booking with tampered payload', async () => {
    config.payment.enabled = true;

    const { owner } = await createTestOwner();
    const { customer } = await createTestCustomer();
    const car = await createTestCar(owner._id);
    const booking = await createTestBooking(customer._id, owner._id, car._id, {
      razorpayOrderId: 'order_legit_456',
    });

    const payload = {
      event: 'payment.captured',
      payload: { payload: { payment: { entity: { order_id: 'order_legit_456' } } } },
    };

    // Send with an invalid signature
    const res = await request
      .post('/api/webhooks/razorpay')
      .set('x-razorpay-signature', 'bad-sig')
      .send(payload);

    expect(res.status).toBe(400);

    // Booking should remain unchanged
    const dbBooking = await Booking.findById(booking._id);
    expect(dbBooking.paymentStatus).toBe('pending');
    expect(dbBooking.status).toBe('pending');

    config.payment.enabled = false;
  });

  it('should handle non-captured events gracefully', async () => {
    const payload = {
      event: 'payment.failed',
      payload: { payload: { payment: { entity: { order_id: 'order_xxx' } } } },
    };

    const res = await request
      .post('/api/webhooks/razorpay')
      .set('x-razorpay-signature', generateValidSignature(payload))
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('failed');
  });
});
