import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { cacheService } from '../../src/config/redis.js';

let mongoServer;

export const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: { version: '7.0.0' },
    instance: { launchTimeout: 60000 }, // 60s startup timeout
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

export const disconnectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) await mongoServer.stop();
};

export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  // Clear in-memory/Redis cache to prevent cross-test data pollution
  try {
    await cacheService.flush();
  } catch (err) {
    console.error('Failed to flush cache in clearTestDB:', err);
  }
};

