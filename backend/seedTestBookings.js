const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');
const Chauffeur = require('./models/Chauffeur');
require('dotenv').config();

const seedTestBookings = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rideserene');
    console.log('Connected to MongoDB');

    // Get the first customer (or specify email)
    const customer = await Customer.findOne();
    if (!customer) {
      console.log('No customer found. Please create a customer account first.');
      process.exit(1);
    }

    console.log('Found customer:', customer.email);

    // Get an approved chauffeur
    const chauffeur = await Chauffeur.findOne({ status: 'approved' });

    // Create some completed bookings
    const completedBookings = [];
    for (let i = 0; i < 5; i++) {
      const booking = await Booking.create({
        customer: customer._id,
        chauffeur: chauffeur?._id,
        rideType: 'one-way',
        pickupLocation: {
          address: `${100 + i * 10} Test Street, New York, NY`,
          coordinates: { latitude: 40.7128, longitude: -74.0060 }
        },
        dropoffLocation: {
          address: `${200 + i * 10} Park Avenue, New York, NY`,
          coordinates: { latitude: 40.7589, longitude: -73.9851 }
        },
        pickupDate: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000), // Past dates
        pickupTime: '10:00',
        vehicleClass: {
          name: 'Luxury Sedan',
          type: 'sedan'
        },
        passengerInfo: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone
        },
        basePrice: 50 + i * 10,
        taxes: 5 + i,
        fees: 3,
        totalPrice: 58 + i * 11,
        status: 'completed',
        completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      });
      completedBookings.push(booking);
    }

    console.log(`Created ${completedBookings.length} completed bookings`);

    // Create some upcoming bookings
    const upcomingBookings = [];
    for (let i = 0; i < 3; i++) {
      const booking = await Booking.create({
        customer: customer._id,
        chauffeur: chauffeur?._id,
        rideType: 'one-way',
        pickupLocation: {
          address: `${300 + i * 10} Broadway, New York, NY`,
          coordinates: { latitude: 40.7614, longitude: -73.9776 }
        },
        dropoffLocation: {
          address: `${400 + i * 10} Fifth Avenue, New York, NY`,
          coordinates: { latitude: 40.7614, longitude: -73.9776 }
        },
        pickupDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // Future dates
        pickupTime: '14:00',
        vehicleClass: {
          name: 'Luxury SUV',
          type: 'suv'
        },
        passengerInfo: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone
        },
        basePrice: 75 + i * 10,
        taxes: 8 + i,
        fees: 5,
        totalPrice: 88 + i * 11,
        status: i === 0 ? 'confirmed' : 'pending'
      });
      upcomingBookings.push(booking);
    }

    console.log(`Created ${upcomingBookings.length} upcoming bookings`);

    // Update customer wallet balance
    customer.wallet = {
      balance: 250.00,
      currency: 'USD'
    };
    await customer.save();
    console.log('Updated customer wallet balance to $250.00');

    console.log('\n✅ Test data seeded successfully!');
    console.log(`\nStats for ${customer.email}:`);
    console.log(`- Total Rides: ${completedBookings.length}`);
    console.log(`- Upcoming Rides: ${upcomingBookings.length}`);
    console.log(`- Wallet Balance: $${customer.wallet.balance.toFixed(2)}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding test bookings:', error);
    process.exit(1);
  }
};

seedTestBookings();
