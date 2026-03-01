// Test script to verify login and booking visibility
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Customer = require('./models/Customer');
const Booking = require('./models/Booking');

async function testLoginAndBooking() {
  try {
    console.log('\n=== TESTING LOGIN AND BOOKING VISIBILITY ===\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the customer
    const customer = await Customer.findOne({ email: 'musa@gmail.com' });
    
    if (!customer) {
      console.log('❌ Customer musa@gmail.com not found!');
      console.log('\nCreating test customer...');
      
      const newCustomer = await Customer.create({
        firstName: 'Musa',
        lastName: 'Kiani',
        email: 'musa@gmail.com',
        password: 'password123', // Will be hashed by pre-save hook
        phone: '+1234567890',
        isVerified: true
      });
      
      console.log('✅ Customer created:', newCustomer.email);
      console.log('   Password: password123');
      console.log('   Customer ID:', newCustomer._id);
      
      // Create a test booking for this customer
      const booking = await Booking.create({
        customer: newCustomer._id,
        rideType: 'one-way',
        pickupLocation: {
          address: 'New York, NY, USA',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        dropoffLocation: {
          address: 'Los Angeles, CA, USA',
          coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        pickupDate: new Date('2025-12-10'),
        pickupTime: '14:00',
        vehicleClass: {
          id: 'business',
          name: 'Business Class',
          vehicle: 'Mercedes-Benz E-Class',
          passengers: 3,
          luggage: 2
        },
        passengerInfo: {
          firstName: 'Musa',
          lastName: 'Kiani',
          email: 'musa@gmail.com',
          phone: '+1234567890'
        },
        basePrice: 269.86,
        totalPrice: 269.86,
        currency: 'USD',
        status: 'confirmed',
        paymentStatus: 'completed',
        paymentMethod: 'credit_card',
        transactionId: `TXN-${Date.now()}`,
        paidAt: new Date()
      });
      
      console.log('✅ Test booking created:', booking.bookingReference);
    } else {
      console.log('✅ Customer found:', customer.email);
      console.log('   Customer ID:', customer._id);
      console.log('   Name:', customer.firstName, customer.lastName);
      
      // Test password
      console.log('\n--- Testing Password ---');
      
      if (!customer.password) {
        console.log('❌ Customer has no password set!');
        console.log('\nSetting password to "password123"...');
        customer.password = 'password123';
        await customer.save();
        console.log('✅ Password set successfully');
      } else {
        const testPassword = 'password123';
        const isMatch = await bcrypt.compare(testPassword, customer.password);
        
        if (isMatch) {
          console.log('✅ Password "password123" is CORRECT');
        } else {
          console.log('❌ Password "password123" is INCORRECT');
          console.log('\nResetting password to "password123"...');
          customer.password = 'password123';
          await customer.save();
          console.log('✅ Password reset complete');
        }
      }
    }
    
    // Find all bookings for this customer
    const customerForBookings = await Customer.findOne({ email: 'musa@gmail.com' });
    const bookings = await Booking.find({ customer: customerForBookings._id })
      .sort({ createdAt: -1 });
    
    console.log('\n--- Bookings for musa@gmail.com ---');
    console.log(`Total bookings: ${bookings.length}\n`);
    
    if (bookings.length === 0) {
      console.log('❌ No bookings found! Creating test booking...');
      
      const booking = await Booking.create({
        customer: customerForBookings._id,
        rideType: 'one-way',
        pickupLocation: {
          address: 'New York, NY, USA',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        dropoffLocation: {
          address: 'Los Angeles, CA, USA',
          coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        pickupDate: new Date('2025-12-10'),
        pickupTime: '14:00',
        vehicleClass: {
          id: 'business',
          name: 'Business Class',
          vehicle: 'Mercedes-Benz E-Class',
          passengers: 3,
          luggage: 2
        },
        passengerInfo: {
          firstName: 'Musa',
          lastName: 'Kiani',
          email: 'musa@gmail.com',
          phone: '+1234567890'
        },
        basePrice: 269.86,
        totalPrice: 269.86,
        currency: 'USD',
        status: 'confirmed',
        paymentStatus: 'completed',
        paymentMethod: 'credit_card',
        transactionId: `TXN-${Date.now()}`,
        paidAt: new Date()
      });
      
      console.log('✅ Test booking created:', booking.bookingReference);
      console.log('   Status:', booking.status);
      console.log('   Price:', booking.totalPrice);
    } else {
      bookings.forEach((booking, index) => {
        console.log(`Booking ${index + 1}:`);
        console.log('  Reference:', booking.bookingReference);
        console.log('  Status:', booking.status);
        console.log('  From:', booking.pickupLocation.address);
        console.log('  To:', booking.dropoffLocation?.address || 'N/A');
        console.log('  Date:', booking.pickupDate.toLocaleDateString());
        console.log('  Time:', booking.pickupTime);
        console.log('  Price: $' + booking.totalPrice);
        console.log('  Created:', booking.createdAt.toLocaleString());
        console.log('');
      });
    }
    
    console.log('\n=== INSTRUCTIONS TO TEST ===');
    console.log('1. Open browser to: http://localhost:5173/login');
    console.log('2. Login with:');
    console.log('   Email: musa@gmail.com');
    console.log('   Password: password123');
    console.log('3. You should be redirected to: http://localhost:5173/dashboard');
    console.log('4. Click on "Ride History" tab');
    console.log('5. You should see', bookings.length, 'booking(s)');
    console.log('6. Open browser console (F12) to see debug logs');
    console.log('\n=== END ===\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testLoginAndBooking();
