import { jest } from '@jest/globals';

// Mock external services
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

const { default: supertest } = await import('supertest');
const { connectTestDB, disconnectTestDB, clearTestDB } = await import('./setup/db.js');
const { default: app } = await import('./setup/app.js');
const { createTestCustomer } = await import('./setup/helpers.js');
const { validateBufferMime, scanForThreats } = await import('../src/utils/fileScanner.js');
const { revokeAllUserSessions } = await import('../src/utils/tokenRevocation.js');

const request = supertest(app);

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await disconnectTestDB(); });
beforeEach(async () => { await clearTestDB(); });

describe('Enterprise Hardening Tests', () => {

  describe('W3C Traceparent Context Propagation', () => {
    it('should generate a correlation ID and traceparent header when not provided', async () => {
      const res = await request.get('/health/live');
      expect(res.headers['x-correlation-id']).toBeDefined();
      expect(res.headers['traceparent']).toBeDefined();
      expect(res.headers['traceparent']).toMatch(/^00-[a-f0-9]{32}-[a-f0-9]{16}-01$/i);
    });

    it('should propagate correlation ID and traceparent when provided in request headers', async () => {
      const customCorrelationId = 'test-corr-id-12345';
      const customTraceparent = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';
      
      const res = await request.get('/health/live')
        .set('x-correlation-id', customCorrelationId)
        .set('traceparent', customTraceparent);
        
      expect(res.headers['x-correlation-id']).toBe(customCorrelationId);
      expect(res.headers['traceparent']).toBe(customTraceparent);
    });
  });

  describe('Secure Metrics Routing (/metrics)', () => {
    let originalAuthEnabled;
    let originalUsername;
    let originalPassword;

    beforeAll(() => {
      originalAuthEnabled = process.env.METRICS_AUTH_ENABLED;
      originalUsername = process.env.METRICS_USERNAME;
      originalPassword = process.env.METRICS_PASSWORD;
    });

    afterAll(() => {
      process.env.METRICS_AUTH_ENABLED = originalAuthEnabled;
      process.env.METRICS_USERNAME = originalUsername;
      process.env.METRICS_PASSWORD = originalPassword;
    });

    it('should bypass basic auth when METRICS_AUTH_ENABLED is not "true"', async () => {
      process.env.METRICS_AUTH_ENABLED = 'false';
      const res = await request.get('/metrics');
      expect(res.status).toBe(200);
      expect(res.text).toContain('process_cpu_user_seconds_total');
    });

    it('should reject requests without auth when METRICS_AUTH_ENABLED is "true"', async () => {
      process.env.METRICS_AUTH_ENABLED = 'true';
      process.env.METRICS_USERNAME = 'metrics-user';
      process.env.METRICS_PASSWORD = 'metrics-pass';

      const res = await request.get('/metrics');
      expect(res.status).toBe(401);
      expect(res.headers['www-authenticate']).toBeDefined();
    });

    it('should allow requests with correct credentials when METRICS_AUTH_ENABLED is "true"', async () => {
      process.env.METRICS_AUTH_ENABLED = 'true';
      process.env.METRICS_USERNAME = 'metrics-user';
      process.env.METRICS_PASSWORD = 'metrics-pass';

      const authHeader = 'Basic ' + Buffer.from('metrics-user:metrics-pass').toString('base64');
      const res = await request.get('/metrics').set('Authorization', authHeader);
      expect(res.status).toBe(200);
      expect(res.text).toContain('process_cpu_user_seconds_total');
    });

    it('should reject requests with wrong credentials when METRICS_AUTH_ENABLED is "true"', async () => {
      process.env.METRICS_AUTH_ENABLED = 'true';
      process.env.METRICS_USERNAME = 'metrics-user';
      process.env.METRICS_PASSWORD = 'metrics-pass';

      const authHeader = 'Basic ' + Buffer.from('wrong-user:wrong-pass').toString('base64');
      const res = await request.get('/metrics').set('Authorization', authHeader);
      expect(res.status).toBe(401);
    });
  });

  describe('Token Revocation & Lifecycle', () => {
    it('should invalidate token on logout', async () => {
      const { cookie } = await createTestCustomer();

      // Retrieve profile successfully first
      let profileRes = await request.get('/api/auth/profile').set('Cookie', cookie);
      expect(profileRes.status).toBe(200);

      // Perform logout
      const logoutRes = await request.post('/api/auth/logout').set('Cookie', cookie);
      expect(logoutRes.status).toBe(200);

      // Attempt to retrieve profile again with the logged-out token
      profileRes = await request.get('/api/auth/profile').set('Cookie', cookie);
      expect(profileRes.status).toBe(401);
      expect(profileRes.body.message).toContain('Token is no longer valid');
    });

    it('should reject tokens issued before user session revocation timestamp', async () => {
      const { customer, cookie } = await createTestCustomer();

      // Verify the user can access their profile initially
      let profileRes = await request.get('/api/auth/profile').set('Cookie', cookie);
      expect(profileRes.status).toBe(200);

      // Revoke all sessions for this user
      await revokeAllUserSessions(customer._id.toString());

      // Attempt to access profile, should be rejected as the token was issued before revocation
      profileRes = await request.get('/api/auth/profile').set('Cookie', cookie);
      expect(profileRes.status).toBe(401);
      expect(profileRes.body.message).toContain('User session has been revoked');
    });
  });

  describe('File Scanner Behavior', () => {
    it('should validate allowed MIME types correctly using magic bytes', () => {
      // Hex for PNG signature: 89504E470D0A1A0A
      const pngBuffer = Buffer.from('89504E470D0A1A0A00000000', 'hex');
      expect(validateBufferMime(pngBuffer, ['image/png'])).toBe(true);

      const fakeTxtBuffer = Buffer.from('This is some plain text document content');
      expect(validateBufferMime(fakeTxtBuffer, ['image/png'])).toBe(false);
    });

    it('should identify threat signatures in file content', () => {
      // Executable header
      const exeBuffer = Buffer.from('4D5A900003000000', 'hex'); // MZ header
      expect(scanForThreats(exeBuffer)).toBe(false);

      // PHP code payload
      const phpPayload = Buffer.from('<?php echo "evil"; ?>');
      expect(scanForThreats(phpPayload)).toBe(false);

      // JS Script payload
      const jsPayload = Buffer.from('<script>alert(1)</script>');
      expect(scanForThreats(jsPayload)).toBe(false);

      // Clean image bytes (pretend PNG header + plain data)
      const cleanBuffer = Buffer.from('89504E470D0A1A0ACleanDataHere', 'ascii');
      expect(scanForThreats(cleanBuffer)).toBe(true);
    });
  });

  describe('Health Probes (/health/live & /health/ready)', () => {
    it('should return UP on liveness check', async () => {
      const res = await request.get('/health/live');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
    });

    it('should return UP or DOWN status on readiness check', async () => {
      const res = await request.get('/health/ready');
      expect([200, 503]).toContain(res.status);
      expect(res.body.status).toBeDefined();
      expect(res.body.checks).toBeDefined();
      expect(res.body.checks.database).toBeDefined();
      expect(res.body.checks.cache).toBeDefined();
    });
  });
});
