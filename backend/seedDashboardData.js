const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PromoCode = require('./models/PromoCode');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Sample promo codes
const promoCodes = [
  {
    code: 'WELCOME20',
    description: '20% off your first ride',
    discountType: 'percentage',
    discountValue: 20,
    minAmount: 50,
    maxDiscount: 50,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    usageLimit: 1000,
    isActive: true,
  },
  {
    code: 'LUXURY50',
    description: '$50 off luxury rides',
    discountType: 'fixed',
    discountValue: 50,
    minAmount: 200,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    usageLimit: 500,
    isActive: true,
  },
  {
    code: 'VIP15',
    description: '15% off for VIP members',
    discountType: 'percentage',
    discountValue: 15,
    minAmount: 100,
    maxDiscount: 100,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
    usageLimit: null, // unlimited
    isActive: true,
  },
  {
    code: 'AIRPORT25',
    description: '$25 off airport transfers',
    discountType: 'fixed',
    discountValue: 25,
    minAmount: 75,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    usageLimit: 200,
    isActive: true,
  },
];

// Seed function
async function seedData() {
  try {
    // Clear existing promo codes
    await PromoCode.deleteMany({});
    console.log('Cleared existing promo codes');

    // Insert new promo codes
    const inserted = await PromoCode.insertMany(promoCodes);
    console.log(`Inserted ${inserted.length} promo codes`);

    console.log('\n✅ Dashboard data seeded successfully!');
    console.log('\nAvailable Promo Codes:');
    inserted.forEach(promo => {
      console.log(`- ${promo.code}: ${promo.description}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

// Run seed
seedData();
