const express = require('express');
const router = express.Router();
const Owner = require('../models/Owner');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const validate = require('../middleware/validate');
const { registerRules, loginRules } = require('../validators/authValidator');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

router.post('/register', registerRules, validate, async (req, res) => {
  try {
    const { name, email, password, phone, businessName } = req.body;

    const existingOwner = await Owner.findOne({ email });
    if (existingOwner) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const owner = await Owner.create({ name, email, password, phone, businessName });
    
    const token = generateToken(owner._id, 'owner');
    
    res.cookie('owner_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ 
      success: true, 
      data: { 
        id: owner._id, 
        name: owner.name, 
        email: owner.email, 
        businessName: owner.businessName 
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.post('/login', loginRules, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    const owner = await Owner.findOne({ email }).select('+password');
    if (!owner) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (owner.isLocked) {
      return res.status(423).json({ success: false, message: 'Account locked. Try again later.' });
    }

    const isMatch = await owner.correctPassword(password, owner.password);
    if (!isMatch) {
      owner.loginAttempts += 1;
      if (owner.loginAttempts >= 5) {
        owner.lockUntil = Date.now() + 15 * 60 * 1000;
      }
      await owner.save();
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    owner.loginAttempts = 0;
    owner.lockUntil = undefined;
    await owner.save();

    const token = generateToken(owner._id, 'owner');
    
    res.cookie('owner_token', token, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ 
      success: true, 
      data: { 
        id: owner._id, 
        name: owner.name, 
        email: owner.email,
        businessName: owner.businessName
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('owner_token');
  res.json({ success: true, message: 'Logged out' });
});

module.exports = router;