const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const validate = require('../middleware/validate');
const { contactRules } = require('../validators/contactValidator');

router.post('/', contactRules, validate, async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contact = await Contact.create({ name, email, message });
    res.status(201).json({ success: true, message: 'Your message has been received.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

module.exports = router;