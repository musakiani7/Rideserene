const mongoose = require('mongoose');

const favoriteLocationSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  label: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  placeId: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },
  type: {
    type: String,
    enum: ['home', 'work', 'airport', 'other'],
    default: 'other',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

favoriteLocationSchema.index({ customer: 1 });

module.exports = mongoose.model('FavoriteLocation', favoriteLocationSchema);
