const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const Booking = require('./models/Booking');
require('dotenv').config();

async function linkBookingsToCustomers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rideserene');
    console.log('MongoDB Connected...');

    const customers = await Customer.find();
    const bookings = await Booking.find();

    console.log(`Found ${customers.length} customers and ${bookings.length} bookings`);

    let idx = 0;
    for (const booking of bookings) {
      booking.customer = customers[idx % customers.length]._id;
      await booking.save();
      idx++;
    }

    console.log(`✅ Linked ${bookings.length} bookings to ${customers.length} customers`);

    // Show customer stats
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
    console.error('Error:', error);
    process.exit(1);
  }
}

linkBookingsToCustomers();
