const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const Booking = require('./models/Booking');
require('dotenv').config();

const sampleCustomers = [
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+1234567890',
    password: 'password123',
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1234567891',
    password: 'password123',
  },
  {
    firstName: 'Michael',
    lastName: 'Williams',
    email: 'michael.williams@example.com',
    phone: '+1234567892',
    password: 'password123',
  },
  {
    firstName: 'Emma',
    lastName: 'Brown',
    email: 'emma.brown@example.com',
    phone: '+1234567893',
    password: 'password123',
  },
  {
    firstName: 'David',
    lastName: 'Jones',
    email: 'david.jones@example.com',
    phone: '+1234567894',
    password: 'password123',
  },
  {
    firstName: 'Lisa',
    lastName: 'Davis',
    email: 'lisa.davis@example.com',
    phone: '+1234567895',
    password: 'password123',
  },
  {
    firstName: 'Robert',
    lastName: 'Miller',
    email: 'robert.miller@example.com',
    phone: '+1234567896',
    password: 'password123',
  },
  {
    firstName: 'Jennifer',
    lastName: 'Wilson',
    email: 'jennifer.wilson@example.com',
    phone: '+1234567897',
    password: 'password123',
  },
];

async function seedCustomers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rideserene');
    console.log('MongoDB Connected...');

    // Clear existing customers
    await Customer.deleteMany({});
    console.log('Cleared existing customers');

    // Create customers
    const customers = await Customer.create(sampleCustomers);
    console.log(`✅ Successfully created ${customers.length} customers`);

    // Get customer booking stats
    for (const customer of customers) {
      const bookingCount = await Booking.countDocuments({ customer: customer._id });
      const totalSpent = await Booking.aggregate([
        { $match: { customer: customer._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]);
      
      console.log(`${customer.firstName} ${customer.lastName}: ${bookingCount} bookings, $${totalSpent[0]?.total || 0} spent`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding customers:', error);
    process.exit(1);
  }
}

seedCustomers();
