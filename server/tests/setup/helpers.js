import jwt from 'jsonwebtoken';
import { config } from '../../src/config/env.js';
import Customer from '../../src/models/Customer.js';
import Owner from '../../src/models/Owner.js';
import Car from '../../src/models/Car.js';
import Booking from '../../src/models/Booking.js';

let seq = 0;
const uid = () => ++seq;

/**
 * Create a test customer in the DB and return { customer, token, cookie }
 */
export const createTestCustomer = async (overrides = {}) => {
  const n = uid();
  const data = {
    name: `Test Customer ${n}`,
    email: `customer${n}@test.com`,
    password: 'Test@1234',
    phone: `9${String(n).padStart(9, '0')}`,
    ...overrides,
  };
  const customer = await Customer.create(data);
  const token = jwt.sign(
    { id: customer._id, role: 'customer' },
    config.jwt.secret,
    { expiresIn: '1d' }
  );
  return { customer, token, cookieName: 'customerToken', cookie: `customerToken=${token}` };
};

/**
 * Create a test owner in the DB and return { owner, token, cookie }
 */
export const createTestOwner = async (overrides = {}) => {
  const n = uid();
  const data = {
    name: `Test Owner ${n}`,
    email: `owner${n}@test.com`,
    password: 'Test@1234',
    phone: `8${String(n).padStart(9, '0')}`,
    businessName: `TestBiz ${n}`,
    ...overrides,
  };
  const owner = await Owner.create(data);
  const token = jwt.sign(
    { id: owner._id, role: 'owner' },
    config.jwt.secret,
    { expiresIn: '1d' }
  );
  return { owner, token, cookieName: 'ownerToken', cookie: `ownerToken=${token}` };
};

/**
 * Create a test car owned by the given ownerId
 */
export const createTestCar = async (ownerId, overrides = {}) => {
  const n = uid();
  const data = {
    make: `TestMake${n}`,
    model: `TestModel${n}`,
    year: 2024,
    category: 'sedan',
    fuelType: 'Petrol',
    transmission: 'Manual',
    registrationNumber: `GJ-01-AB-${String(n).padStart(4, '0')}`,
    pricePerDay: 1000,
    description: `Test car description ${n}`,
    location: 'Junagadh',
    owner: ownerId,
    images: [],
    isActive: true,
    isDeleted: false,
    ...overrides,
  };
  return Car.create(data);
};

/**
 * Create a test booking
 */
export const createTestBooking = async (customerId, ownerId, carId, overrides = {}) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 3);

  const data = {
    car: carId,
    owner: ownerId,
    customer: customerId,
    startDate: tomorrow,
    endDate: dayAfter,
    totalPrice: 3000,
    status: 'pending',
    paymentStatus: 'pending',
    razorpayOrderId: `mock_order_${uid()}`,
    ...overrides,
  };
  return Booking.create(data);
};

/**
 * Generate an expired JWT
 */
export const createExpiredToken = (userId, role = 'customer') => {
  return jwt.sign(
    { id: userId, role },
    config.jwt.secret,
    { expiresIn: '0s' }
  );
};
