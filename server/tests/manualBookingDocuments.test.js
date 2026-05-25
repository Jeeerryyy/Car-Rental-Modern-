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

// Mock Cloudinary service to return dummy URLs
jest.unstable_mockModule('../src/services/cloudinary.service.js', () => ({
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
  deleteMultipleImages: jest.fn(),
  uploadCarImages: jest.fn(),
  uploadProfileImage: jest.fn(),
  uploadDocument: jest.fn(async () => ({
    url: 'https://res.cloudinary.com/demo/image/upload/v12345/kyc_mock.jpg',
    publicId: 'kyc_mock'
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

// Dynamic imports
const { default: supertest } = await import('supertest');
const { connectTestDB, disconnectTestDB, clearTestDB } = await import('./setup/db.js');
const { default: app } = await import('./setup/app.js');
const { createTestOwner, createTestCar } = await import('./setup/helpers.js');
const { default: Booking } = await import('../src/models/Booking.js');
const { getInvoiceData } = await import('../src/services/invoice.service.js');

const request = supertest(app);

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await disconnectTestDB(); });
beforeEach(async () => { await clearTestDB(); });

describe('Manual Booking KYC Documents Integration Tests', () => {
  it('should create a manual booking with KYC images, upload them, and populate the invoice', async () => {
    const { owner, cookie: ownerCookie } = await createTestOwner();
    const car = await createTestCar(owner._id, { color: 'Red' });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 3);

    // Mock base64 image strings
    const mockBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

    const payload = {
      customer: {
        name: 'Dhaval Patel',
        email: 'dhaval@example.com',
        phone: '9898989898',
        address: '123, Main Street, Junagadh',
        drivingLicenceNumber: 'GJ1120200000000'
      },
      booking: {
        carId: car._id.toString(),
        startDate: tomorrow.toISOString(),
        endDate: dayAfter.toISOString(),
        paymentStatus: 'paid',
        securityDeposit: 5000,
        amountPaid: 3000,
        notes: 'Testing manual booking documents',
        documents: {
          aadhaar: {
            front: mockBase64,
            back: mockBase64
          },
          license: {
            front: mockBase64,
            back: mockBase64
          }
        }
      }
    };

    const res = await request
      .post('/api/owner/bookings/manual')
      .set('Cookie', ownerCookie)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.booking).toBeDefined();

    // Verify documents are saved on the Booking document in the database
    const dbBooking = await Booking.findById(res.body.data.booking._id);
    expect(dbBooking).not.toBeNull();
    expect(dbBooking.documents.aadhaar.front.url).toBe('https://res.cloudinary.com/demo/image/upload/v12345/kyc_mock.jpg');
    expect(dbBooking.documents.aadhaar.back.url).toBe('https://res.cloudinary.com/demo/image/upload/v12345/kyc_mock.jpg');
    expect(dbBooking.documents.license.front.url).toBe('https://res.cloudinary.com/demo/image/upload/v12345/kyc_mock.jpg');
    expect(dbBooking.documents.license.back.url).toBe('https://res.cloudinary.com/demo/image/upload/v12345/kyc_mock.jpg');

    // Verify invoice data loads the uploaded document URLs
    const invoiceData = await getInvoiceData(dbBooking._id, owner._id);
    expect(invoiceData.aadhaarFront).toBe('https://res.cloudinary.com/demo/image/upload/v12345/kyc_mock.jpg');
    expect(invoiceData.aadhaarBack).toBe('https://res.cloudinary.com/demo/image/upload/v12345/kyc_mock.jpg');
    expect(invoiceData.licenseFront).toBe('https://res.cloudinary.com/demo/image/upload/v12345/kyc_mock.jpg');
    expect(invoiceData.licenseBack).toBe('https://res.cloudinary.com/demo/image/upload/v12345/kyc_mock.jpg');
    expect(invoiceData.drivingLicenceNumber).toBe('GJ1120200000000');
    expect(invoiceData.customerAddress).toBe('123, Main Street, Junagadh');
  });
});
