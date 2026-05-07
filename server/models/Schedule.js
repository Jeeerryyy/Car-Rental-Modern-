const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  pricing: [{
    tier: { type: String, required: true }, // VIP, Premium, etc.
    price: { type: Number, required: true }
  }],
  status: { type: String, enum: ['Scheduled', 'On-Going', 'Completed', 'Cancelled'], default: 'Scheduled' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
