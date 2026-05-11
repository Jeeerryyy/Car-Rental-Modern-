import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

const connectDB = async () => {
  let retries = 5;
  let connected = false;

  while (retries > 0 && !connected) {
    try {
      const conn = await mongoose.connect(config.mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      });
      connected = true;
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      retries--;
      logger.error(`MongoDB Connection Failed. Retries left: ${retries} - ${error.message}`);
      if (retries === 0) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB Disconnected. Attempting reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB Reconnected');
  });

  return mongoose.connection;
};

export default connectDB;
