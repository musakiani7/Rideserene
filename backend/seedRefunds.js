const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Refund = require('./models/Refund');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Refunds Seeding...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const seedRefunds = async () => {
  try {
    await connectDB();

    // Clear existing refunds
    await Refund.deleteMany({});
    console.log('Cleared existing refunds');

    // Get all customers
    const customers = await Customer.find().limit(5);
    if (customers.length === 0) {
      console.log('No customers found. Please seed customers first.');
      process.exit(1);
    }

    console.log(`Found ${customers.length} customers`);

    // For each customer, get their cancelled or completed bookings
    let totalRefundsCreated = 0;

    for (const customer of customers) {
      // Get cancelled and completed bookings for this customer
      const eligibleBookings = await Booking.find({
        customer: customer._id,
        status: { $in: ['cancelled', 'completed'] },
        totalPrice: { $gt: 0 }
      }).limit(3);

      if (eligibleBookings.length === 0) {
        console.log(`No eligible bookings for customer: ${customer.email}`);
        continue;
      }

      console.log(`Found ${eligibleBookings.length} eligible bookings for ${customer.email}`);

      // Create refunds for some of these bookings
      const refundsToCreate = eligibleBookings.slice(0, 2); // Create refunds for first 2 bookings

      for (let i = 0; i < refundsToCreate.length; i++) {
        const booking = refundsToCreate[i];
        
        // Vary the refund status
        const statuses = ['pending', 'processing', 'completed', 'rejected'];
        const status = statuses[i % statuses.length];
        
        // Vary the refund reasons
        const reasons = [
          'booking_cancellation',
          'service_issue',
          'overcharge',
          'no_show',
          'customer_request',
          'other'
        ];
        const reason = reasons[i % reasons.length];

        // Vary refund methods
        const refundMethods = ['wallet', 'original_payment'];
        const refundMethod = refundMethods[i % refundMethods.length];

        // Create refund
        const refundData = {
          customer: customer._id,
          booking: booking._id,
          amount: booking.totalPrice,
          reason: reason,
          refundMethod: refundMethod,
          status: status,
          requestedAt: new Date(Date.now() - (i * 2) * 24 * 60 * 60 * 1000), // Stagger dates
        };

        // Add processed date for completed/rejected refunds
        if (status === 'completed' || status === 'rejected') {
          refundData.processedAt = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
        }

        // Add notes based on status
        if (status === 'completed') {
          refundData.notes = 'Refund processed successfully. Amount credited to your account.';
        } else if (status === 'rejected') {
          refundData.notes = 'Refund request rejected. Booking was within non-refundable period.';
        } else if (status === 'processing') {
          refundData.notes = 'Your refund is being processed. Please allow 3-5 business days.';
        } else {
          refundData.notes = 'Refund request received. Our team will review it shortly.';
        }

        const refund = await Refund.create(refundData);
        totalRefundsCreated++;
        
        console.log(`Created ${status} refund for booking ${booking.bookingReference} - $${booking.totalPrice}`);
      }
    }

    console.log('\n✅ Refunds Seeding Complete!');
    console.log(`Total refunds created: ${totalRefundsCreated}`);
    console.log('\nRefund Summary:');
    
    const refundsByStatus = await Refund.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    refundsByStatus.forEach(item => {
      console.log(`  ${item._id}: ${item.count} refunds, Total: $${item.totalAmount.toFixed(2)}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding refunds:', error);
    process.exit(1);
  }
};

// Run the seed function
seedRefunds();
