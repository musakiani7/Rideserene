const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');

dotenv.config();

const createCancelledBooking = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Get first customer
    const customer = await Customer.findOne({ email: 'musa@gmail.com' });
    
    if (!customer) {
      console.log('❌ Customer not found');
      process.exit(1);
    }

    console.log(`Creating cancelled booking for: ${customer.firstName} ${customer.lastName}\n`);

    // Create a cancelled booking
    const booking = await Booking.create({
      customer: customer._id,
      rideType: 'one-way',
      pickupLocation: {
        address: '123 Main Street, New York, NY',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      dropoffLocation: {
        address: '456 Park Avenue, New York, NY',
        coordinates: { lat: 40.7614, lng: -73.9776 }
      },
      pickupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      pickupTime: '14:00',
      vehicleClass: {
        name: 'Luxury Sedan',
        category: 'sedan'
      },
      numberOfPassengers: 2,
      numberOfLuggage: 1,
      passengerInfo: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone || '+1234567890'
      },
      basePrice: 100.00,
      totalPrice: 125.00,
      status: 'cancelled',
      cancellationReason: 'Customer changed plans',
      cancelledAt: new Date()
    });

    console.log('✅ Cancelled booking created successfully!');
    console.log(`   Booking Reference: ${booking.bookingReference}`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Amount: $${booking.totalPrice}`);
    console.log(`   From: ${booking.pickupLocation.address}`);
    console.log(`   To: ${booking.dropoffLocation.address}`);
    console.log(`\nThis booking is now eligible for refund request!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createCancelledBooking();
