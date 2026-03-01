const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');
const Chauffeur = require('./models/Chauffeur');
require('dotenv').config();

const checkAndSeedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rideserene');
    console.log('Connected to MongoDB\n');

    // List all customers
    const customers = await Customer.find().select('email firstName lastName wallet');
    console.log('Available customers:');
    customers.forEach((c, i) => {
      console.log(`${i + 1}. ${c.email} - ${c.firstName} ${c.lastName} - Wallet: $${c.wallet?.balance || 0}`);
    });

    if (customers.length === 0) {
      console.log('\n❌ No customers found! Please create a customer account first.');
      process.exit(1);
    }

    // Use the first customer
    const customer = customers[0];
    console.log(`\n✅ Using customer: ${customer.email}\n`);

    // Check existing bookings
    const existingBookings = await Booking.find({ customer: customer._id });
    console.log(`Found ${existingBookings.length} existing bookings for this customer`);

    // Delete old bookings for clean slate
    if (existingBookings.length > 0) {
      await Booking.deleteMany({ customer: customer._id });
      console.log('Deleted old bookings\n');
    }

    // Get an approved chauffeur
    const chauffeur = await Chauffeur.findOne({ status: 'approved' });
    if (!chauffeur) {
      console.log('⚠️ No approved chauffeur found. Bookings will be created without chauffeur assignment.');
    }

    // Create 5 completed bookings
    console.log('Creating completed bookings...');
    for (let i = 0; i < 5; i++) {
      await Booking.create({
        customer: customer._id,
        chauffeur: chauffeur?._id,
        rideType: 'one-way',
        pickupLocation: {
          address: `${100 + i * 10} Main Street, New York, NY ${10001 + i}`,
          coordinates: { latitude: 40.7128 + i * 0.01, longitude: -74.0060 }
        },
        dropoffLocation: {
          address: `${200 + i * 10} Park Avenue, New York, NY ${10010 + i}`,
          coordinates: { latitude: 40.7589 + i * 0.01, longitude: -73.9851 }
        },
        pickupDate: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
        pickupTime: `${9 + i}:00`,
        vehicleClass: {
          name: i % 2 === 0 ? 'Luxury Sedan' : 'Luxury SUV',
          type: i % 2 === 0 ? 'sedan' : 'suv'
        },
        passengerInfo: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || '+1234567890'
        },
        basePrice: 50 + i * 10,
        taxes: 5 + i,
        fees: 3,
        totalPrice: 58 + i * 11,
        status: 'completed',
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      });
      console.log(`  ✓ Created completed booking ${i + 1}/5`);
    }

    // Create 3 upcoming bookings
    console.log('\nCreating upcoming bookings...');
    for (let i = 0; i < 3; i++) {
      const status = i === 0 ? 'confirmed' : i === 1 ? 'assigned' : 'pending';
      await Booking.create({
        customer: customer._id,
        chauffeur: (status === 'assigned' || status === 'confirmed') ? chauffeur?._id : null,
        rideType: 'one-way',
        pickupLocation: {
          address: `${300 + i * 10} Broadway, New York, NY ${10020 + i}`,
          coordinates: { latitude: 40.7614 + i * 0.01, longitude: -73.9776 }
        },
        dropoffLocation: {
          address: `${400 + i * 10} Fifth Avenue, New York, NY ${10030 + i}`,
          coordinates: { latitude: 40.7589 + i * 0.01, longitude: -73.9851 }
        },
        pickupDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
        pickupTime: `${14 + i}:00`,
        vehicleClass: {
          name: 'Executive Van',
          type: 'van'
        },
        passengerInfo: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || '+1234567890'
        },
        basePrice: 75 + i * 10,
        taxes: 8 + i,
        fees: 5,
        totalPrice: 88 + i * 11,
        status: status
      });
      console.log(`  ✓ Created ${status} booking ${i + 1}/3`);
    }

    // Update customer wallet
    console.log('\nUpdating wallet...');
    customer.wallet = {
      balance: 250.00,
      currency: 'USD'
    };
    await customer.save();
    console.log('  ✓ Wallet balance set to $250.00');

    // Verify the data
    const completedCount = await Booking.countDocuments({ customer: customer._id, status: 'completed' });
    const upcomingCount = await Booking.countDocuments({ 
      customer: customer._id, 
      status: { $in: ['pending', 'confirmed', 'assigned'] },
      pickupDate: { $gte: new Date() }
    });

    console.log('\n' + '='.repeat(50));
    console.log('✅ DATA SEEDED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`\nCustomer: ${customer.email}`);
    console.log(`  Total Completed Rides: ${completedCount}`);
    console.log(`  Upcoming Rides: ${upcomingCount}`);
    console.log(`  Wallet Balance: $${customer.wallet.balance.toFixed(2)}`);
    console.log('\n🔄 Please refresh your browser to see the updated stats!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

checkAndSeedData();
