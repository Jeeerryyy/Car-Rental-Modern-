import { config } from './env.js';
import dotenv from 'dotenv';
dotenv.config();

export const serverConfig = {
  port: config.port || parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: config.nodeEnv || process.env.NODE_ENV || 'development',
  corsOrigins: {
    clientUrl: config.clientUrl || process.env.CLIENT_URL || 'http://localhost:5173',
    ownerUrl: config.ownerUrl || process.env.OWNER_URL || 'http://localhost:5174'
  },
  database: {
    uri: config.mongoUri || process.env.MONGO_URI
  }
};

export default serverConfig;
