/**
 * ============================================================
 * UPLOAD ENDPOINT TESTS — Priority 5
 * ============================================================
 * Tests authenticated file upload and unauthenticated rejection.
 */
import { jest } from '@jest/globals';
import path from 'path';

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
  uploadDocument: jest.fn(async (file) => ({
    url: `https://res.cloudinary.com/test/image/upload/mock_${file.originalname}`,
    publicId: `mock_${Date.now()}`,
  })),
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
const { createTestCustomer, createTestOwner } = await import('./setup/helpers.js');

const request = supertest(app);

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await disconnectTestDB(); });
beforeEach(async () => { await clearTestDB(); });

// ═══════════════════════════════════════════════════════════════
// UPLOAD TESTS
// ═══════════════════════════════════════════════════════════════
describe('File Upload (POST /api/upload)', () => {

  it('should reject unauthenticated upload (401)', async () => {
    const res = await request
      .post('/api/upload')
      .attach('documents', Buffer.from('89504E470D0A1A0A', 'hex'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow authenticated customer to upload a file', async () => {
    const { cookie } = await createTestCustomer();

    const res = await request
      .post('/api/upload')
      .set('Cookie', cookie)
      .attach('documents', Buffer.from('89504E470D0A1A0A', 'hex'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.files).toBeDefined();
    expect(res.body.data.files.length).toBeGreaterThanOrEqual(1);
  });

  it('should allow authenticated owner to upload a file', async () => {
    const { cookie } = await createTestOwner();

    const res = await request
      .post('/api/upload')
      .set('Cookie', cookie)
      .attach('documents', Buffer.from('89504E470D0A1A0A', 'hex'), {
        filename: 'doc.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should allow authenticated customer to upload a PDF file', async () => {
    const { cookie } = await createTestCustomer();

    const res = await request
      .post('/api/upload')
      .set('Cookie', cookie)
      .attach('documents', Buffer.from('255044462D312E340A', 'hex'), { // %PDF-1.4
        filename: 'document.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.files).toBeDefined();
    expect(res.body.data.files[0].url).toContain('mock_document.pdf');
  });
});
