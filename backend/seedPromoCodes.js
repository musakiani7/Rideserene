const mongoose = require('mongoose');
const PromoCode = require('./models/PromoCode');

const promoCodes = [
  {
    code: 'WELCOME20',
    description: 'Welcome bonus - 20% off your first ride',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: 50,
    minAmount: 0,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    usageLimit: 100,
    usedCount: 0,
    isActive: true
  },
  {
    code: 'LUXURY50',
    description: 'Luxury ride special - $50 off premium vehicles',
    discountType: 'fixed',
    discountValue: 50,
    maxDiscount: 0,
    minAmount: 150,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    usageLimit: 50,
    usedCount: 0,
    isActive: true
  },
  {
    code: 'SAVE15',
    description: 'Save 15% on any ride',
    discountType: 'percentage',
    discountValue: 15,
    maxDiscount: 30,
    minAmount: 50,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    usageLimit: 200,
    usedCount: 0,
    isActive: true
  },
  {
    code: 'FLATDEAL25',
    description: 'Flat $25 discount on rides over $100',
    discountType: 'fixed',
    discountValue: 25,
    maxDiscount: 0,
    minAmount: 100,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    usageLimit: 150,
    usedCount: 0,
    isActive: true
  }
];

mongoose.connect('mongodb://localhost:27017/rideserene')
  .then(async () => {
    console.log('MongoDB connected');
    
    // Clear existing promo codes
    await PromoCode.deleteMany({});
    console.log('Cleared existing promo codes');
    
    // Insert new promo codes
    const result = await PromoCode.insertMany(promoCodes);
    console.log(`Created ${result.length} promo codes:`);
    result.forEach(promo => {
      console.log(`  - ${promo.code}: ${promo.description}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
