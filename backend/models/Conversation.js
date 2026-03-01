const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  chauffeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chauffeur',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

conversationSchema.index({ customer: 1, updatedAt: -1 });
conversationSchema.index({ chauffeur: 1, updatedAt: -1 });
// booking already has unique: true, which creates an index – no duplicate

module.exports = mongoose.model('Conversation', conversationSchema);
