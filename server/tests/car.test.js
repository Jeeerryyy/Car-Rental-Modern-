/**
 * ============================================================
 * CAR FLEET TESTS — Priority 4 (Owner Operations)
 * ============================================================
 * Tests CRUD operations for the fleet: create, update, soft
 * delete, listing, and cross-owner isolation.
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
  uploadDocument: jest.fn(),
  uploadCarImages: jest.fn(() => []),
  deleteMultipleImages: jest.fn(),
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
const { createTestOwner, createTestCustomer, createTestCar } = await import('./setup/helpers.js');
const { default: Car } = await import('../src/models/Car.js');

const request = supertest(app);

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await disconnectTestDB(); });
beforeEach(async () => { await clearTestDB(); });

const validCarPayload = {
  make: 'Tata',
  model: 'Nexon',
  year: '2024',
  category: 'suv',
  fuelType: 'Petrol',
  transmission: 'Manual',
  pricePerDay: '1500',
  description: 'A compact SUV with excellent mileage and modern features.',
  location: 'Junagadh',
  registrationNumber: 'GJ-11-AA-0001',
};

// ═══════════════════════════════════════════════════════════════
// CREATE CAR
// ═══════════════════════════════════════════════════════════════
describe('Create Car (POST /api/owner/cars)', () => {

  it('should allow owner to create a car', async () => {
    const { cookie: ownerCookie } = await createTestOwner();

    const res = await request
      .post('/api/owner/cars')
      .set('Cookie', ownerCookie)
      .field('make', validCarPayload.make)
      .field('model', validCarPayload.model)
      .field('year', validCarPayload.year)
      .field('category', validCarPayload.category)
      .field('fuelType', validCarPayload.fuelType)
      .field('transmission', validCarPayload.transmission)
      .field('pricePerDay', validCarPayload.pricePerDay)
      .field('description', validCarPayload.description)
      .field('location', validCarPayload.location)
      .field('registrationNumber', validCarPayload.registrationNumber);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.car.make).toBe('Tata');
    expect(res.body.data.car.model).toBe('Nexon');
  });

  it('should reject car creation with missing required fields', async () => {
    const { cookie: ownerCookie } = await createTestOwner();

    const res = await request
      .post('/api/owner/cars')
      .set('Cookie', ownerCookie)
      .field('make', 'Honda');
    // Missing model, year, category, price, description, location

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject car creation by a customer (403)', async () => {
    const { cookie: custCookie } = await createTestCustomer();

    const res = await request
      .post('/api/owner/cars')
      .set('Cookie', custCookie)
      .field('make', validCarPayload.make)
      .field('model', validCarPayload.model)
      .field('year', validCarPayload.year)
      .field('category', validCarPayload.category)
      .field('pricePerDay', validCarPayload.pricePerDay)
      .field('description', validCarPayload.description)
      .field('location', validCarPayload.location);

    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════
// UPDATE CAR
// ═══════════════════════════════════════════════════════════════
describe('Update Car (PUT /api/owner/cars/:id)', () => {

  it('should allow owner to update their own car', async () => {
    const { owner, cookie: ownerCookie } = await createTestOwner();
    const car = await createTestCar(owner._id);

    const res = await request
      .put(`/api/owner/cars/${car._id}`)
      .set('Cookie', ownerCookie)
      .field('pricePerDay', '2000');

    expect(res.status).toBe(200);
    expect(res.body.data.car.pricePerDay).toBe(2000);
  });

  it('should prevent owner from updating another owner\'s car', async () => {
    const { owner: owner1 } = await createTestOwner();
    const { cookie: owner2Cookie } = await createTestOwner();
    const car = await createTestCar(owner1._id);

    const res = await request
      .put(`/api/owner/cars/${car._id}`)
      .set('Cookie', owner2Cookie)
      .field('pricePerDay', '9999');

    expect(res.status).toBe(404);
  });
});

// ═══════════════════════════════════════════════════════════════
// DELETE CAR (Soft Delete)
// ═══════════════════════════════════════════════════════════════
describe('Delete Car (DELETE /api/owner/cars/:id)', () => {

  it('should soft-delete a car — hide it from public listings', async () => {
    const { owner, cookie: ownerCookie } = await createTestOwner();
    const car = await createTestCar(owner._id);

    // Delete it
    const deleteRes = await request
      .delete(`/api/owner/cars/${car._id}`)
      .set('Cookie', ownerCookie);

    expect(deleteRes.status).toBe(200);

    // Verify it no longer appears in public listings
    const listRes = await request.get('/api/cars');
    const carIds = (listRes.body.data || []).map(c => c._id);
    expect(carIds).not.toContain(car._id.toString());

    // Use raw Mongoose to bypass the pre-find hook that filters isDeleted
    const dbCar = await Car.collection.findOne({ _id: car._id });
    expect(dbCar).not.toBeNull();
    expect(dbCar.isDeleted).toBe(true);
  });

  it('should reject car deletion by a customer (403)', async () => {
    const { owner } = await createTestOwner();
    const { cookie: custCookie } = await createTestCustomer();
    const car = await createTestCar(owner._id);

    const res = await request
      .delete(`/api/owner/cars/${car._id}`)
      .set('Cookie', custCookie);

    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════
// PUBLIC LISTING
// ═══════════════════════════════════════════════════════════════
describe('Public Car Listing (GET /api/cars)', () => {

  it('should return only active, non-deleted cars', async () => {
    const { owner } = await createTestOwner();
    await createTestCar(owner._id); // active
    await createTestCar(owner._id, { isActive: false }); // inactive
    await createTestCar(owner._id, { isDeleted: true }); // deleted

    const res = await request.get('/api/cars');

    expect(res.status).toBe(200);
    // Only the first car should appear
    expect(res.body.data.length).toBe(1);
  });
});
