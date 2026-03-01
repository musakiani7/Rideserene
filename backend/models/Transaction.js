const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  chauffeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chauffeur',
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  type: {
    type: String,
    enum: ['booking_payment', 'refund', 'commission', 'payout', 'penalty', 'bonus'],
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'wallet', 'bank_transfer', 'cash', 'stripe'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
  },
  stripePaymentId: String,
  stripeChargeId: String,
  description: String,
  commission: {
    amount: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
  },
  chauffeurPayout: {
    amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'paid'],
      default: 'pending',
    },
    paidAt: Date,
  },
  metadata: {
    type: Map,
    of: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
});

// Indexes for efficient queries
transactionSchema.index({ booking: 1 });
transactionSchema.index({ customer: 1, createdAt: -1 });
transactionSchema.index({ chauffeur: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
