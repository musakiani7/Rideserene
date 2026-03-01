const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  balanceBefore: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  transactionType: {
    type: String,
    enum: ['add_money', 'booking_payment', 'refund', 'bonus', 'promo_discount'],
    required: true,
  },
  referenceId: {
    type: String, // Could be booking ID, payment ID, etc.
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'cash', 'wallet'],
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
walletTransactionSchema.index({ customer: 1, createdAt: -1 });
walletTransactionSchema.index({ customer: 1, status: 1 });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
