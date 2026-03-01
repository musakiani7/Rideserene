const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Import Booking model
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');

async function checkBookings() {
  try {
    // Get all bookings
    const bookings = await Booking.find().populate('customer', 'firstName lastName email');
    
    console.log('\n=== BOOKINGS IN DATABASE ===');
    console.log(`Total bookings: ${bookings.length}\n`);
    
    if (bookings.length === 0) {
      console.log('No bookings found in database.');
      console.log('\nTo test the ride history:');
      console.log('1. Create a booking through the frontend');
      console.log('2. Or run the test-booking.js script');
    } else {
      bookings.forEach((booking, index) => {
        console.log(`\n--- Booking ${index + 1} ---`);
        console.log(`Reference: ${booking.bookingReference}`);
        console.log(`Customer: ${booking.customer?.firstName} ${booking.customer?.lastName} (${booking.customer?.email})`);
        console.log(`Status: ${booking.status}`);
        console.log(`From: ${booking.pickupLocation?.address || 'N/A'}`);
        console.log(`To: ${booking.dropoffLocation?.address || 'N/A'}`);
        console.log(`Date: ${booking.pickupDate}`);
        console.log(`Time: ${booking.pickupTime}`);
        console.log(`Price: $${booking.totalPrice}`);
        console.log(`Vehicle: ${booking.vehicleClass?.name || 'N/A'}`);
        console.log(`Created: ${booking.createdAt}`);
      });
    }
    
    // Get all customers
    const customers = await Customer.find();
    console.log(`\n\n=== CUSTOMERS IN DATABASE ===`);
    console.log(`Total customers: ${customers.length}\n`);
    
    if (customers.length > 0) {
      customers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.firstName} ${customer.lastName} - ${customer.email}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking bookings:', error);
    process.exit(1);
  }
}

checkBookings();
