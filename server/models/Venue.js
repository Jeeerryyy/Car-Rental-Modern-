const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  address: { type: String },
  capacity: { type: Number, default: 0 },
  layout: {
    rows: { type: Number, default: 10 },
    cols: { type: Number, default: 10 },
    blockedSeats: [{ row: Number, col: Number }], // Manually blocked by owner
    seatTypes: {
      VIP: [{ row: Number, col: Number }],
      Premium: [{ row: Number, col: Number }],
      Standard: [{ row: Number, col: Number }]
    }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Venue', venueSchema);
