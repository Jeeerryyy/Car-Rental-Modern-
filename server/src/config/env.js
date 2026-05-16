import Joi from 'joi';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(5000),
  MONGO_URI: Joi.string().pattern(/^mongodb/).required().messages({
    'string.pattern.base': '"MONGO_URI" must start with "mongodb"'
  }),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRY: Joi.string().required(),
  CLIENT_URL: Joi.string().uri().required(),
  PORTAL_URL: Joi.string().uri().required(),
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  DISABLE_RATE_LIMIT: Joi.boolean().default(false),
  PAYMENT_ENABLED: Joi.boolean().default(false),
  RAZORPAY_KEY_ID: Joi.any().when('PAYMENT_ENABLED', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.optional()
  }),
  RAZORPAY_SECRET: Joi.any().when('PAYMENT_ENABLED', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.optional()
  }),
  GOOGLE_SHEET_ID: Joi.string().optional().allow(''),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: Joi.string().optional().allow(''),
  GOOGLE_PRIVATE_KEY: Joi.string().optional().allow(''),
  SMTP_HOST: Joi.string().optional().allow(''),
  SMTP_PORT: Joi.number().optional().default(587),
  SMTP_USER: Joi.string().optional().allow(''),
  SMTP_PASS: Joi.string().optional().allow(''),
  SMTP_FROM: Joi.string().optional().allow(''),
  SENTRY_DSN: Joi.string().optional().allow(''),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required()
}).unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  console.error(`[Config Error] Missing or invalid environment variables:`);
  error.details.forEach(detail => console.error(` - ${detail.message}`));
  process.exit(1);
}

export const config = {
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoUri: envVars.MONGO_URI,
  jwt: {
    secret: envVars.JWT_SECRET,
    expiry: envVars.JWT_EXPIRY
  },
  clientUrl: envVars.CLIENT_URL,
  portalUrl: envVars.PORTAL_URL,
  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET
  },
  disableRateLimit: envVars.DISABLE_RATE_LIMIT,
  payment: {
    enabled: envVars.PAYMENT_ENABLED,
    keyId: envVars.RAZORPAY_KEY_ID,
    secret: envVars.RAZORPAY_SECRET
  },
  google: {
    clientId: envVars.GOOGLE_CLIENT_ID,
    clientSecret: envVars.GOOGLE_CLIENT_SECRET,
    sheetId: envVars.GOOGLE_SHEET_ID,
    serviceAccountEmail: envVars.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: envVars.GOOGLE_PRIVATE_KEY
  },
  smtp: {
    host: envVars.SMTP_HOST || '',
    port: envVars.SMTP_PORT,
    user: envVars.SMTP_USER || '',
    pass: envVars.SMTP_PASS || '',
    emailFrom: envVars.SMTP_FROM || ''
  }
};
