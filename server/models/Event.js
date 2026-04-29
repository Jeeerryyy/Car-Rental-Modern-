const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  posterImage: { type: String },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  status: { type: String, enum: ['Active', 'Draft', 'Cancelled'], default: 'Draft' },
  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ status: 1 });
eventSchema.index({ venue: 1, startDate: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Event', eventSchema);