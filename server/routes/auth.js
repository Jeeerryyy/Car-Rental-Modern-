const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { body } = require('express-validator');

const User     = require('../models/User');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

const SALT_ROUNDS = 12;
const TOKEN_TTL   = '7d';

function signToken(user) {
  return jwt.sign(
    { user: { id: user.id, role: user.role } },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL },
  );
}

function safeUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, membershipTier: u.membershipTier };
}

/* ── register ────────────────────────────────────────────── */
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ characters'),
  body('phone').optional().trim(),
  validate,
], async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, password: hash, phone });
    const token = signToken(user);

    res.json({ success: true, token, user: safeUser(user) });
  } catch (err) {
    console.error('[auth/register]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ── login ───────────────────────────────────────────────── */
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
    console.error('[auth/login]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ── me ──────────────────────────────────────────────────── */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetOtp -resetOtpExpiry');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('[auth/me]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ── profile update ──────────────────────────────────────── */
router.patch('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('phone').optional().trim(),
  body('licenseNumber').optional().trim(),
  validate,
], async (req, res) => {
  try {
    const fields = {};
    ['name', 'phone', 'licenseNumber'].forEach((k) => {
      if (req.body[k] !== undefined) fields[k] = req.body[k];
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fields },
      { new: true },
    ).select('-password -resetOtp -resetOtpExpiry');

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('[auth/profile]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ── forgot password (OTP) ───────────────────────────────── */
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

    // In production, wire up an email/SMS transport here
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[reset] OTP for ${req.body.email}: ${otp}`);
    }

    res.json({ success: true, message: genericMsg });
  } catch (err) {
    console.error('[auth/forgot]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/* ── reset password ──────────────────────────────────────── */
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
    console.error('[auth/reset]', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
