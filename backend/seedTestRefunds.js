const mongoose = require('mongoose');
const Refund = require('./models/Refund');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');
require('dotenv').config();

async function seedTestRefunds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sherkhan');
    console.log('MongoDB Connected...');

    // Get some completed or cancelled bookings
    const bookings = await Booking.find({
      status: { $in: ['completed', 'cancelled'] }
    }).limit(5);

    if (bookings.length === 0) {
      console.log('No completed or cancelled bookings found. Creating some test refund requests anyway...');
      
      // Get any bookings
      const anyBookings = await Booking.find().limit(5);
      
      if (anyBookings.length === 0) {
        console.log('❌ No bookings found in database. Please create some bookings first.');
        process.exit(0);
      }

      // Get customers
      const customers = await Customer.find();

      if (customers.length === 0) {
        console.log('❌ No customers found in database. Please create some customers first.');
        process.exit(0);
      }

      // Clear existing refunds for testing
      await Refund.deleteMany({});
      console.log('Cleared existing refunds');

      // Create test refunds with different statuses
      const refundReasons = ['booking_cancellation', 'service_issue', 'overcharge', 'customer_request', 'other'];
      const statuses = ['pending', 'processing', 'completed', 'rejected'];
      
      const testRefunds = [];
      
      for (let i = 0; i < Math.min(anyBookings.length, 5); i++) {
        const booking = anyBookings[i];
        const customer = customers[i % customers.length];
        
        testRefunds.push({
          customer: booking.customer || customer._id,
          booking: booking._id,
          amount: booking.totalPrice || 100 + (i * 25),
          reason: refundReasons[i % refundReasons.length],
          status: statuses[i % statuses.length],
          refundMethod: i % 2 === 0 ? 'wallet' : 'original_payment',
          requestedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Stagger dates
          notes: i % 2 === 0 ? `Test refund request #${i + 1}` : undefined,
          processedAt: i > 1 ? new Date(Date.now() - ((i - 2) * 12 * 60 * 60 * 1000)) : undefined
        });
      }

      const createdRefunds = await Refund.insertMany(testRefunds);
      console.log(`✅ Created ${createdRefunds.length} test refund requests`);
      
      console.log('\nRefund Summary:');
      for (const refund of createdRefunds) {
        const populated = await Refund.findById(refund._id)
          .populate('customer', 'firstName lastName email')
          .populate('booking', 'bookingReference totalPrice');
        
        console.log(`- ${populated.customer?.firstName || 'Unknown'} ${populated.customer?.lastName || ''}: $${populated.amount.toFixed(2)} - ${populated.status.toUpperCase()}`);
        console.log(`  Booking: ${populated.booking?.bookingReference || 'N/A'}, Reason: ${populated.reason}`);
      }

      process.exit(0);
    }

    // Get customers
    const customers = await Customer.find();

    if (customers.length === 0) {
      console.log('❌ No customers found in database. Please create some customers first.');
      process.exit(0);
    }

    // Clear existing refunds for testing
    await Refund.deleteMany({});
    console.log('Cleared existing refunds');

    // Create test refunds with different statuses
    const refundReasons = ['booking_cancellation', 'service_issue', 'overcharge', 'customer_request', 'other'];
    const statuses = ['pending', 'processing', 'completed', 'rejected'];
    
    const testRefunds = [];
    
    for (let i = 0; i < Math.min(bookings.length, 5); i++) {
      const booking = bookings[i];
      const customer = customers[i % customers.length];
      
      testRefunds.push({
        customer: booking.customer || customer._id,
        booking: booking._id,
        amount: booking.totalPrice || 100 + (i * 25),
        reason: refundReasons[i % refundReasons.length],
        status: statuses[i % statuses.length],
        refundMethod: i % 2 === 0 ? 'wallet' : 'original_payment',
        requestedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Stagger dates
        notes: i % 2 === 0 ? `Test refund request #${i + 1}` : undefined,
        processedAt: i > 1 ? new Date(Date.now() - ((i - 2) * 12 * 60 * 60 * 1000)) : undefined
      });
    }

    const createdRefunds = await Refund.insertMany(testRefunds);
    console.log(`✅ Created ${createdRefunds.length} test refund requests`);
    
    console.log('\nRefund Summary:');
    for (const refund of createdRefunds) {
      const populated = await Refund.findById(refund._id)
        .populate('customer', 'firstName lastName email')
        .populate('booking', 'bookingReference totalPrice');
      
      console.log(`- ${populated.customer?.firstName || 'Unknown'} ${populated.customer?.lastName || ''}: $${populated.amount.toFixed(2)} - ${populated.status.toUpperCase()}`);
      console.log(`  Booking: ${populated.booking?.bookingReference || 'N/A'}, Reason: ${populated.reason}`);
    }

    // Show statistics
    const stats = {
      total: await Refund.countDocuments(),
      pending: await Refund.countDocuments({ status: 'pending' }),
      processing: await Refund.countDocuments({ status: 'processing' }),
      completed: await Refund.countDocuments({ status: 'completed' }),
      rejected: await Refund.countDocuments({ status: 'rejected' })
    };

    console.log('\n📊 Refund Statistics:');
    console.log(`Total: ${stats.total}`);
    console.log(`Pending: ${stats.pending}`);
    console.log(`Processing: ${stats.processing}`);
    console.log(`Completed: ${stats.completed}`);
    console.log(`Rejected: ${stats.rejected}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding refunds:', error);
    process.exit(1);
  }
}

seedTestRefunds();
