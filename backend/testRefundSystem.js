const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Refund = require('./models/Refund');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const testRefundSystem = async () => {
  try {
    await connectDB();

    console.log('\n========================================');
    console.log('    REFUND SYSTEM VERIFICATION');
    console.log('========================================\n');

    // 1. Check Refund Model
    console.log('1. Checking Refund Model...');
    const refundCount = await Refund.countDocuments();
    console.log(`   ✅ Refunds in database: ${refundCount}`);

    // 2. Check Refund Statuses
    console.log('\n2. Refund Status Distribution:');
    const statusCounts = await Refund.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    statusCounts.forEach(item => {
      console.log(`   ${item._id.toUpperCase()}: ${item.count} refunds ($${item.totalAmount.toFixed(2)})`);
    });

    // 3. Check Refund Reasons
    console.log('\n3. Refund Reason Distribution:');
    const reasonCounts = await Refund.aggregate([
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    reasonCounts.forEach(item => {
      console.log(`   ${item._id}: ${item.count} refunds`);
    });

    // 4. Check Refund Methods
    console.log('\n4. Refund Method Distribution:');
    const methodCounts = await Refund.aggregate([
      {
        $group: {
          _id: '$refundMethod',
          count: { $sum: 1 }
        }
      }
    ]);

    methodCounts.forEach(item => {
      console.log(`   ${item._id}: ${item.count} refunds`);
    });

    // 5. Sample Refunds with Details
    console.log('\n5. Sample Refunds:');
    const sampleRefunds = await Refund.find()
      .populate('customer', 'firstName lastName email')
      .populate('booking', 'bookingReference totalPrice status')
      .limit(5)
      .sort({ createdAt: -1 });

    sampleRefunds.forEach((refund, index) => {
      console.log(`\n   Refund #${index + 1}:`);
      console.log(`   - Customer: ${refund.customer?.firstName} ${refund.customer?.lastName} (${refund.customer?.email})`);
      console.log(`   - Booking: ${refund.booking?.bookingReference}`);
      console.log(`   - Amount: $${refund.amount.toFixed(2)}`);
      console.log(`   - Status: ${refund.status}`);
      console.log(`   - Reason: ${refund.reason}`);
      console.log(`   - Method: ${refund.refundMethod}`);
      console.log(`   - Requested: ${refund.requestedAt.toLocaleDateString()}`);
    });

    // 6. Check Eligible Bookings for Refunds
    console.log('\n6. Eligible Bookings (not yet refunded):');
    const refundedBookingIds = await Refund.distinct('booking');
    const eligibleBookings = await Booking.find({
      status: { $in: ['cancelled', 'completed'] },
      _id: { $nin: refundedBookingIds },
      totalPrice: { $gt: 0 }
    }).limit(10);

    console.log(`   Found ${eligibleBookings.length} eligible bookings for refund`);
    
    if (eligibleBookings.length > 0) {
      eligibleBookings.slice(0, 3).forEach((booking, index) => {
        console.log(`   - Booking ${index + 1}: ${booking.bookingReference} ($${booking.totalPrice.toFixed(2)}) - ${booking.status}`);
      });
    }

    // 7. Statistics
    console.log('\n7. Overall Statistics:');
    const stats = await Refund.aggregate([
      {
        $group: {
          _id: null,
          totalRefunds: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          minAmount: { $min: '$amount' },
          maxAmount: { $max: '$amount' }
        }
      }
    ]);

    if (stats.length > 0) {
      const stat = stats[0];
      console.log(`   Total Refunds: ${stat.totalRefunds}`);
      console.log(`   Total Amount: $${stat.totalAmount.toFixed(2)}`);
      console.log(`   Average Amount: $${stat.avgAmount.toFixed(2)}`);
      console.log(`   Min Amount: $${stat.minAmount.toFixed(2)}`);
      console.log(`   Max Amount: $${stat.maxAmount.toFixed(2)}`);
    }

    // 8. Check Customers with Refunds
    console.log('\n8. Customers with Most Refunds:');
    const customerRefunds = await Refund.aggregate([
      {
        $group: {
          _id: '$customer',
          refundCount: { $sum: 1 },
          totalRefunded: { $sum: '$amount' }
        }
      },
      { $sort: { refundCount: -1 } },
      { $limit: 5 }
    ]);

    for (const item of customerRefunds) {
      const customer = await Customer.findById(item._id).select('firstName lastName email');
      console.log(`   ${customer?.firstName} ${customer?.lastName}: ${item.refundCount} refunds ($${item.totalRefunded.toFixed(2)})`);
    }

    console.log('\n========================================');
    console.log('   ✅ VERIFICATION COMPLETE');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing refund system:', error);
    process.exit(1);
  }
};

// Run the test
testRefundSystem();
