const crypto = require('crypto');
const logger = require('./logger');

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;

const verifyRazorpaySignature = (payload, signature, secret) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret || RAZORPAY_KEY_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    logger.error(`[WEBHOOK] Razorpay signature verification failed: ${error.message}`);
    return false;
  }
};

const verifyPayuSignature = (payload, merchantKey, hash) => {
  try {
    const hashString = `${merchantKey || PAYU_MERCHANT_KEY}|${payload.status}||${payload.txnid || payload.txnid
      }|${payload.amount}|${payload.productinfo}|${payload.firstname}|${payload.email}|||||||||||${process.env.PAYU_SALT}`;

    const expectedHash = crypto
      .createHash('sha512')
      .update(hashString)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(expectedHash)
    );
  } catch (error) {
    logger.error(`[WEBHOOK] PayU signature verification failed: ${error.message}`);
    return false;
  }
};

const generateWebhookSignature = (payload, secret) => {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
};

const verifyCloudinarySignature = (timestamp, signature, apiSecret) => {
  try {
    const expectedSignature = crypto
      .createHash('sha1')
      .update(`timestamp=${timestamp}${apiSecret || process.env.CLOUDINARY_API_SECRET}`)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    logger.error(`[WEBHOOK] Cloudinary signature verification failed: ${error.message}`);
    return false;
  }
};

const webhookMiddleware = (provider) => {
  return (req, res, next) => {
    const { body, headers } = req;

    if (provider === 'razorpay') {
      const signature = headers['x-razorpay-signature'];
      if (!signature || !verifyRazorpaySignature(body, signature)) {
        logger.warn(`[WEBHOOK] Invalid Razorpay signature from ${req.ip}`);
        return res.status(401).json({ success: false, error: 'Invalid signature' });
      }
    }

    if (provider === 'payu') {
      const hash = body.hash;
      if (!hash || !verifyPayuSignature(body, headers['x-merchant-key'])) {
        logger.warn(`[WEBHOOK] Invalid PayU signature from ${req.ip}`);
        return res.status(401).json({ success: false, error: 'Invalid signature' });
      }
    }

    next();
  };
};

module.exports = {
  verifyRazorpaySignature,
  verifyPayuSignature,
  generateWebhookSignature,
  verifyCloudinarySignature,
  webhookMiddleware,
};