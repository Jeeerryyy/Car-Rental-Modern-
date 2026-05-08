const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientType: { type: String, enum: ['owner', 'customer'], required: true },
  recipient: { type: mongoose.Schema.ObjectId, required: true },
  type: { 
    type: String, 
    enum: ['new_booking', 'booking_pending_approval', 'booking_confirmed', 'booking_completed', 'booking_cancelled', 'booking_rejected', 'new_review', 'review_approved', 'kyc_submitted', 'kyc_approved', 'kyc_rejected', 'direct_message'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: String,
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ recipientType: 1, recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);