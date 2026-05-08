const express = require('express');
const router = express.Router();
const Customer = require('../../models/Customer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../../config/env');
const validate = require('../../middleware/validate');
const { registerRules, loginRules } = require('../../validators/authValidator');

const generateToken = (id, role) => {
  const secret = process.env.CUSTOMER_JWT_SECRET || config.jwt.secret;
  return jwt.sign({ id, role }, secret, { expiresIn: config.jwt.expiresIn });
};

router.post('/register', registerRules, validate, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const customer = await Customer.create({ name, email, password, phone });
    const token = generateToken(customer._id, 'customer');
    
    res.cookie('customer_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ 
      success: true, 
      data: { id: customer._id, name: customer.name, email: customer.email } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.post('/login', loginRules, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email }).select('+password');
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (customer.failedAttempts >= 5 && customer.lockUntil && customer.lockUntil > Date.now()) {
      const remaining = Math.ceil((customer.lockUntil - Date.now()) / 1000 / 60);
      return res.status(423).json({ success: false, message: `Account locked. Try again in ${remaining} minutes.` });
    }

    const isMatch = await customer.correctPassword(password, customer.password);
    if (!isMatch) {
      customer.failedAttempts += 1;
      if (customer.failedAttempts >= 5) {
        customer.lockUntil = Date.now() + 15 * 60 * 1000;
      }
      await customer.save();
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    customer.failedAttempts = 0;
    customer.lockUntil = undefined;
    await customer.save();

    const token = generateToken(customer._id, 'customer');
    
    res.cookie('customer_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ 
      success: true, 
      data: { id: customer._id, name: customer.name, email: customer.email } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('customer_token');
  res.json({ success: true, message: 'Logged out' });
});

module.exports = router;