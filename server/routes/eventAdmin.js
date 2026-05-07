const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Venue = require('../models/Venue');
const Event = require('../models/Event');
const Schedule = require('../models/Schedule');
const EventBooking = require('../models/EventBooking');

// Helper to broadcast to owner room
const broadcastUpdate = (req, type, data) => {
  const io = req.app.get('io');
  if (io) {
    io.to('owner-dashboard').emit('data-sync', { type, data, timestamp: new Date() });
  }
};

/* ── VENUES ──────────────────────────────────────────────── */

router.get('/venues', protect, admin, async (req, res) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });
    res.json(venues);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/venues', protect, admin, async (req, res) => {
  try {
    const venue = await Venue.create(req.body);
    broadcastUpdate(req, 'VENUE_CREATED', venue);
    res.status(201).json(venue);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/venues/:id', protect, admin, async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    broadcastUpdate(req, 'VENUE_UPDATED', venue);
    res.json(venue);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/venues/:id', protect, admin, async (req, res) => {
  try {
    await Venue.findByIdAndDelete(req.params.id);
    broadcastUpdate(req, 'VENUE_DELETED', { id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/* ── EVENTS ──────────────────────────────────────────────── */

router.get('/events', protect, admin, async (req, res) => {
  try {
    const events = await Event.find().populate('venue').sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/events', protect, admin, async (req, res) => {
  try {
    const event = await Event.create(req.body);
    const populated = await Event.findById(event._id).populate('venue');
    broadcastUpdate(req, 'EVENT_CREATED', populated);
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/events/:id', protect, admin, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('venue');
    broadcastUpdate(req, 'EVENT_UPDATED', event);
    res.json(event);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/* ── SCHEDULES ────────────────────────────────────────────── */

router.get('/schedules', protect, admin, async (req, res) => {
  try {
    const schedules = await Schedule.find().populate('event').sort({ startTime: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/schedules', protect, admin, async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    const populated = await Schedule.findById(schedule._id).populate('event');
    broadcastUpdate(req, 'SCHEDULE_CREATED', populated);
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
