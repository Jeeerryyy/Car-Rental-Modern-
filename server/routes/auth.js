/**
 * Auth Routes - User authentication, registration, profile management, OAuth
 * @module routes/auth
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/User');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const SALT_ROUNDS = 12;
const TOKEN_TTL = '7d';

/**
 * Generate JWT token for authenticated user
 * @param {Object} user - User document
 * @returns {string} JWT token
 */
function signToken(user) {
  return jwt.sign(
    { user: { id: user.id, role: user.role } },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL, algorithm: 'HS256', issuer: 'modern-selfdrive' },
  );
}

/**
 * Sanitize user object for response - excludes sensitive fields
 * @param {Object} u - User document
 * @returns {Object} Safe user object
 */
function safeUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, membershipTier: u.membershipTier };
}

/**
 * POST /api/auth/register - Create new user account
 */
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ characters'),
  body('phone').optional().trim(),
  validate,
], async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, password: hash, phone });
    const token = signToken(user);

    res.json({ success: true, token, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/auth/login - Authenticate user and return JWT
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
], async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    res.json({ success: true, token: signToken(user), user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/auth/owner-login - Dedicated owner login with credentials from env
 */
router.post('/owner-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const OWNER_EMAIL = process.env.OWNER_EMAIL;
    const OWNER_PASSWORD = process.env.OWNER_PASSWORD;
    
    if (!OWNER_EMAIL || !OWNER_PASSWORD) {
      logger.error('[AUTH] Owner credentials not configured in environment');
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }
    
    if (email === OWNER_EMAIL && password === OWNER_PASSWORD) {
      let user = await User.findOne({ email });
      
      if (!user) {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        user = await User.create({ 
          name: 'Modern Drive Owner', 
          email, 
          password: hash, 
          role: 'admin',
          termsAccepted: true 
        });
      } else if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }

      return res.json({ 
        success: true, 
        token: signToken(user), 
        user: { ...safeUser(user), termsAccepted: user.termsAccepted } 
      });
    }

    res.status(401).json({ success: false, error: 'Unauthorized Access' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/auth/me - Get current authenticated user profile
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -resetOtp -resetOtpExpiry');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * PATCH /api/auth/profile - Update user profile fields
 */
router.patch('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('phone').optional().trim(),
  body('licenseNumber').optional().trim(),
  validate,
], async (req, res) => {
  try {
    const fields = {};
    ['name', 'phone', 'licenseNumber'].forEach((key) => {
      if (req.body[key] !== undefined) fields[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: fields },
      { new: true },
    ).select('-password -resetOtp -resetOtpExpiry');

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/auth/forgot-password - Request password reset OTP
 */
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
  validate,
], async (req, res) => {
  const genericMsg = 'If this email is registered, you will receive reset instructions.';

  try {
    const user = await User.findOne({ email: req.body.email }).select('+resetOtp +resetOtpExpiry');
    if (!user) return res.json({ success: true, message: genericMsg });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = await bcrypt.hash(otp, 10);
    user.resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Dev mode OTP logging - remove in production
    if (process.env.NODE_ENV !== 'production') {
      process.stdout.write(`[DEV] OTP for ${req.body.email}: ${otp}\n`);
    }

    res.json({ success: true, message: genericMsg });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/auth/reset-password - Reset password using OTP
 */
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be 6+ characters'),
  validate,
], async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email }).select('+resetOtp +resetOtpExpiry');

    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset request' });
    }

    if (Date.now() > user.resetOtpExpiry.getTime()) {
      return res.status(400).json({ success: false, error: 'OTP expired — request a new one' });
    }

    if (!(await bcrypt.compare(otp, user.resetOtp))) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset — you can now sign in.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /api/auth/google - Google OAuth authentication
 */
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, error: 'No token provided' });

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, googleId, password: '' });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const jwtToken = signToken(user);
    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        kyc: user.kyc,
        termsAccepted: user.termsAccepted
      },
    });
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid Google token' });
  }
});

/**
 * POST /api/auth/kyc - Upload KYC document (driving license)
 */
router.post('/kyc', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    let fileUrl = req.file.path;
    if (!fileUrl.startsWith('http')) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    user.kyc = { drivingLicenseUrl: fileUrl, status: 'pending' };
    await user.save();

    res.json({ success: true, kyc: user.kyc });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

/**
 * POST /api/auth/accept-terms - Accept terms and conditions
 */
router.post('/accept-terms', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.termsAccepted = true;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * DELETE /api/auth/account - Delete own account
 */
router.delete('/account', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * PATCH /api/auth/remove-admin - Remove admin role (make regular user)
 */
router.patch('/remove-admin', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.role = 'user';
    user.name = user.name.replace(/owner/gi, '').trim() || user.name;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
