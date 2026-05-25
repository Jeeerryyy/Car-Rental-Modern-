/**
 * ============================================================
 * AUTH & AUTHORIZATION TESTS — Priority 1 (Critical)
 * ============================================================
 * Tests customer/owner registration, login, logout, JWT
 * validation, role-based access control, and cookie security.
 */
import { jest } from '@jest/globals';

// ── Mock external services BEFORE any imports that use them ──
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

// ── Now dynamically import everything ──
const { default: supertest } = await import('supertest');
const { connectTestDB, disconnectTestDB, clearTestDB } = await import('./setup/db.js');
const { default: app } = await import('./setup/app.js');
const { createTestCustomer, createTestOwner, createExpiredToken } = await import('./setup/helpers.js');
const { default: Customer } = await import('../src/models/Customer.js');

const request = supertest(app);

// ── Lifecycle ──
beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await disconnectTestDB(); });
beforeEach(async () => { await clearTestDB(); });

// ═══════════════════════════════════════════════════════════════
// CUSTOMER AUTH
// ═══════════════════════════════════════════════════════════════
describe('Customer Auth (/api/auth)', () => {

  describe('POST /api/auth/register', () => {
    it('should register a customer and return an HttpOnly cookie', async () => {
      const res = await request
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@test.com',
          password: 'Test@1234',
          phone: '9876543210',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer).toBeDefined();
      expect(res.body.data.customer.email).toBe('john@test.com');
      // Password must never be exposed
      expect(res.body.data.customer.password).toBeUndefined();

      // Verify HttpOnly cookie is set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const customerCookie = cookies.find(c => c.startsWith('customerToken='));
      expect(customerCookie).toBeDefined();
      expect(customerCookie).toMatch(/HttpOnly/i);
    });

    it('should reject duplicate email registration', async () => {
      await request.post('/api/auth/register').send({
        name: 'A', email: 'dup@test.com', password: 'Test@1234', phone: '9876543211',
      });
      const res = await request.post('/api/auth/register').send({
        name: 'B', email: 'dup@test.com', password: 'Test@1234', phone: '9876543212',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with a weak password', async () => {
      const res = await request.post('/api/auth/register').send({
        name: 'Weak', email: 'weak@test.com', password: 'simple',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login and return an HttpOnly cookie', async () => {
      // Seed user
      await request.post('/api/auth/register').send({
        name: 'Login User', email: 'login@test.com', password: 'Test@1234', phone: '9876543213',
      });

      const res = await request.post('/api/auth/login').send({
        email: 'login@test.com', password: 'Test@1234',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer.email).toBe('login@test.com');

      const cookies = res.headers['set-cookie'];
      const customerCookie = cookies.find(c => c.startsWith('customerToken='));
      expect(customerCookie).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      await request.post('/api/auth/register').send({
        name: 'X', email: 'x@test.com', password: 'Test@1234', phone: '9876543214',
      });
      const res = await request.post('/api/auth/login').send({
        email: 'x@test.com', password: 'WrongPass@1',
      });
      expect(res.status).toBe(401);
    });

    it('should reject login for non-existent email', async () => {
      const res = await request.post('/api/auth/login').send({
        email: 'ghost@test.com', password: 'Test@1234',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear the customerToken cookie', async () => {
      const { cookie } = await createTestCustomer();
      const res = await request
        .post('/api/auth/logout')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      const cookies = res.headers['set-cookie'];
      const cleared = cookies?.find(c => c.startsWith('customerToken='));
      // Cookie should be expired / value empty
      expect(cleared).toBeDefined();
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// OWNER AUTH
// ═══════════════════════════════════════════════════════════════
describe('Owner Auth (/api/owner/auth)', () => {

  describe('POST /api/owner/auth/register', () => {
    it('should register an owner and return an HttpOnly ownerToken cookie', async () => {
      const res = await request
        .post('/api/owner/auth/register')
        .send({
          name: 'Owner Joe',
          email: 'owner@test.com',
          password: 'Owner@1234',
          phone: '8876543210',
          businessName: 'TestBiz',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.owner).toBeDefined();

      const cookies = res.headers['set-cookie'];
      const ownerCookie = cookies.find(c => c.startsWith('ownerToken='));
      expect(ownerCookie).toBeDefined();
      expect(ownerCookie).toMatch(/HttpOnly/i);
    });
  });

  describe('POST /api/owner/auth/login', () => {
    it('should login an owner', async () => {
      await request.post('/api/owner/auth/register').send({
        name: 'Owner L', email: 'ownerl@test.com', password: 'Owner@1234',
        phone: '8876543211', businessName: 'Biz',
      });

      const res = await request.post('/api/owner/auth/login').send({
        email: 'ownerl@test.com', password: 'Owner@1234',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/owner/auth/logout', () => {
    it('should clear the ownerToken cookie', async () => {
      const { cookie } = await createTestOwner();
      const res = await request
        .post('/api/owner/auth/logout')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// PROTECTED ROUTES & RBAC
// ═══════════════════════════════════════════════════════════════
describe('Auth Guards', () => {

  it('should reject unauthenticated access to protected route (401)', async () => {
    const res = await request.get('/api/auth/profile');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject an expired JWT (401)', async () => {
    const { customer } = await createTestCustomer();
    const expiredToken = createExpiredToken(customer._id, 'customer');
    // Wait a moment for the token to truly expire
    await new Promise(r => setTimeout(r, 1100));

    const res = await request
      .get('/api/auth/profile')
      .set('Cookie', `customerToken=${expiredToken}`);

    expect(res.status).toBe(401);
  });

  it('should reject a tampered/invalid JWT (401)', async () => {
    const res = await request
      .get('/api/auth/profile')
      .set('Cookie', 'customerToken=invalid.token.here');

    expect(res.status).toBe(401);
  });

  it('owner routes should reject customer cookie (401 — no ownerToken found)', async () => {
    const { cookie } = await createTestCustomer();
    const res = await request
      .get('/api/owner/auth/profile')
      .set('Cookie', cookie);

    // protect() only checks ownerToken for /api/owner/* routes
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('restrictTo("owner") should allow owner role (200)', async () => {
    const { cookie } = await createTestOwner();
    const res = await request
      .get('/api/owner/auth/profile')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.owner).toBeDefined();
  });

  it('should allow authenticated customer to access their profile', async () => {
    const { cookie } = await createTestCustomer();
    const res = await request
      .get('/api/auth/profile')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.customer).toBeDefined();
  });
});
