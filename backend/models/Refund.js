const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    enum: [
      'booking_cancellation',
      'service_issue',
      'overcharge',
      'no_show',
      'customer_request',
      'other'
    ],
    default: 'booking_cancellation'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending',
    index: true
  },
  refundMethod: {
    type: String,
    enum: ['wallet', 'original_payment'],
    default: 'wallet'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  notes: {
    type: String
  },
  transactionId: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
refundSchema.index({ customer: 1, status: 1 });
refundSchema.index({ booking: 1 });

module.exports = mongoose.model('Refund', refundSchema);
