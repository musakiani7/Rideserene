const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');
const Refund = require('./models/Refund');

dotenv.config();

const checkBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Get all customers
    const customers = await Customer.find().select('firstName lastName email');
    
    for (const customer of customers) {
      console.log(`\n📋 Bookings for: ${customer.firstName} ${customer.lastName} (${customer.email})`);
      console.log('='.repeat(80));
      
      const bookings = await Booking.find({ customer: customer._id })
        .select('bookingReference status totalPrice pickupDate pickupLocation dropoffLocation')
        .sort({ createdAt: -1 });
      
      console.log(`Total Bookings: ${bookings.length}`);
      
      // Group by status
      const statusGroups = {};
      bookings.forEach(b => {
        if (!statusGroups[b.status]) statusGroups[b.status] = [];
        statusGroups[b.status].push(b);
      });
      
      Object.keys(statusGroups).forEach(status => {
        console.log(`\n  ${status.toUpperCase()}: ${statusGroups[status].length} bookings`);
        statusGroups[status].slice(0, 3).forEach(b => {
          console.log(`    - ${b.bookingReference} ($${b.totalPrice})`);
        });
      });
      
      // Check for refunds
      const refunds = await Refund.find({ customer: customer._id });
      const refundedBookingIds = refunds.map(r => r.booking.toString());
      
      console.log(`\n  REFUNDED: ${refunds.length} bookings`);
      
      // Check eligible for refund
      const eligible = bookings.filter(b => 
        (b.status === 'cancelled' || b.status === 'completed') && 
        !refundedBookingIds.includes(b._id.toString()) &&
        b.totalPrice > 0
      );
      
      console.log(`  ELIGIBLE FOR REFUND: ${eligible.length} bookings`);
      if (eligible.length > 0) {
        eligible.slice(0, 3).forEach(b => {
          console.log(`    - ${b.bookingReference} - ${b.status} ($${b.totalPrice})`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Check Complete\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkBookings();
