const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  type: {
    type: String,
    enum: ['booking_created', 'chauffeur_assigned'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

notificationSchema.index({ customer: 1, createdAt: -1 });
notificationSchema.index({ customer: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

