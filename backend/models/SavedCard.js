const mongoose = require('mongoose');

const savedCardSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  stripePaymentMethodId: {
    type: String,
    required: true,
  },
  cardBrand: {
    type: String,
    required: true,
  },
  last4: {
    type: String,
    required: true,
  },
  expiryMonth: {
    type: Number,
    required: true,
  },
  expiryYear: {
    type: Number,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

savedCardSchema.index({ customer: 1 });

module.exports = mongoose.model('SavedCard', savedCardSchema);
