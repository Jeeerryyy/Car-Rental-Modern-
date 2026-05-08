const dotenv = require('dotenv');

dotenv.config();

const requiredVariables = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'CLIENT_URL',
];

const missingVariables = [];

for (const envVar of requiredVariables) {
  if (!process.env[envVar]) {
    missingVariables.push(envVar);
  }
}

if (missingVariables.length > 0) {
  console.error('\n[FATAL] Missing required environment variables:');
  missingVariables.forEach(v => console.error(`  - ${v}`));
  console.error('\nPlease check your .env file or deployment configuration.\n');
  process.exit(1);
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error('\n[FATAL] JWT_SECRET must be at least 32 characters long.\n');
  process.exit(1);
}

if (process.env.CUSTOMER_JWT_SECRET && process.env.CUSTOMER_JWT_SECRET.length < 32) {
  console.error('\n[FATAL] CUSTOMER_JWT_SECRET must be at least 32 characters long.\n');
  process.exit(1);
}

if (process.env.CUSTOMER_JWT_SECRET && process.env.CUSTOMER_JWT_SECRET === process.env.JWT_SECRET) {
  console.error('\n[FATAL] CUSTOMER_JWT_SECRET must be different from JWT_SECRET.\n');
  process.exit(1);
}

if (process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.startsWith('rzp_')) {
  console.error('\n[FATAL] RAZORPAY_KEY_ID must start with rzp_\n');
  process.exit(1);
}

const config = {
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),
  db: {
    uri: process.env.MONGODB_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  customerJwt: {
    secret: process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  clientUrl: process.env.CLIENT_URL,
  clientUrlProd: process.env.CLIENT_URL_PROD || process.env.CLIENT_URL,
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  emailFrom: process.env.EMAIL_FROM,
};

module.exports = config;