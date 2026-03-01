const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Transaction = require('./models/Transaction');
const Payout = require('./models/Payout');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');
const Chauffeur = require('./models/Chauffeur');

dotenv.config();

const generateTransactionId = () => {
  return 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const generatePayoutId = () => {
  return 'PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const seedFinanceData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Get existing data
    const bookings = await Booking.find({ status: 'completed' }).limit(50);
    const customers = await Customer.find().limit(10);
    const chauffeurs = await Chauffeur.find({ isApproved: true }).limit(10);

    if (bookings.length === 0 || customers.length === 0) {
      console.log('No bookings or customers found. Please seed bookings first.');
      process.exit(1);
    }

    console.log(`Found ${bookings.length} bookings, ${customers.length} customers, ${chauffeurs.length} chauffeurs`);

    // Clear existing finance data
    await Transaction.deleteMany({});
    await Payout.deleteMany({});
    console.log('Cleared existing transactions and payouts');

    // Create Transactions from bookings
    const transactions = [];
    const commissionRate = 0.15; // 15% commission

    for (const booking of bookings) {
      const amount = booking.totalPrice || 100;
      const commission = amount * commissionRate;
      const chauffeurPayout = amount - commission;

      transactions.push({
        transactionId: generateTransactionId(),
        booking: booking._id,
        customer: booking.customer,
        chauffeur: booking.chauffeur,
        amount: amount,
        type: 'booking_payment',
        paymentMethod: ['card', 'wallet', 'stripe'][Math.floor(Math.random() * 3)],
        status: 'completed',
        stripePaymentId: 'pi_' + Math.random().toString(36).substr(2, 20),
        description: `Payment for booking ${booking.bookingReference}`,
        commission: {
          amount: commission,
          percentage: commissionRate * 100,
        },
        chauffeurPayout: {
          amount: chauffeurPayout,
          status: Math.random() > 0.5 ? 'paid' : 'pending',
        },
        createdAt: booking.pickupDateTime || new Date(),
        completedAt: booking.pickupDateTime || new Date(),
      });
    }

    // Add some refund transactions
    for (let i = 0; i < 5; i++) {
      const booking = bookings[i];
      const amount = (booking.totalPrice || 100) * 0.5; // 50% refund

      transactions.push({
        transactionId: generateTransactionId(),
        booking: booking._id,
        customer: booking.customer,
        amount: amount,
        type: 'refund',
        paymentMethod: 'stripe',
        status: 'completed',
        description: `Refund for booking ${booking.bookingReference}`,
        createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - Math.random() * 9 * 24 * 60 * 60 * 1000),
      });
    }

    const createdTransactions = await Transaction.insertMany(transactions);
    console.log(`✅ Created ${createdTransactions.length} transactions`);

    // Create Payouts for chauffeurs
    const payouts = [];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    for (const chauffeur of chauffeurs) {
      // Get transactions for this chauffeur
      const chauffeurTransactions = createdTransactions.filter(
        t => t.chauffeur && t.chauffeur.toString() === chauffeur._id.toString() && t.type === 'booking_payment'
      );

      if (chauffeurTransactions.length > 0) {
        const totalEarnings = chauffeurTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalCommission = chauffeurTransactions.reduce((sum, t) => sum + t.commission.amount, 0);
        const netAmount = totalEarnings - totalCommission;

        const statuses = ['pending', 'approved', 'completed', 'processing'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        payouts.push({
          payoutId: generatePayoutId(),
          chauffeur: chauffeur._id,
          amount: netAmount,
          period: {
            startDate: startOfMonth,
            endDate: endOfMonth,
          },
          bookings: chauffeurTransactions.map(t => t.booking),
          transactions: chauffeurTransactions.map(t => t._id),
          status: status,
          paymentMethod: 'bank_transfer',
          bankDetails: {
            accountName: `${chauffeur.firstName} ${chauffeur.lastName}`,
            accountNumber: '**** **** ' + Math.floor(1000 + Math.random() * 9000),
            bankName: ['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank'][Math.floor(Math.random() * 4)],
          },
          breakdown: {
            totalEarnings: totalEarnings,
            commission: totalCommission,
            deductions: 0,
            netAmount: netAmount,
            ridesCount: chauffeurTransactions.length,
          },
          createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
          ...(status === 'approved' && { approvedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) }),
          ...(status === 'completed' && { 
            approvedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
          }),
        });
      }
    }

    const createdPayouts = await Payout.insertMany(payouts);
    console.log(`✅ Created ${createdPayouts.length} payouts`);

    // Calculate statistics
    const totalRevenue = createdTransactions
      .filter(t => t.status === 'completed' && t.type === 'booking_payment')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCommission = createdTransactions
      .filter(t => t.status === 'completed' && t.type === 'booking_payment')
      .reduce((sum, t) => sum + t.commission.amount, 0);

    const totalRefunds = createdTransactions
      .filter(t => t.type === 'refund')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingPayouts = createdPayouts
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    // Display summary
    console.log('\n💰 Finance & Payouts Data Summary:');
    console.log('=====================================');
    console.log(`Total Transactions: ${createdTransactions.length}`);
    console.log(`  - Booking Payments: ${createdTransactions.filter(t => t.type === 'booking_payment').length}`);
    console.log(`  - Refunds: ${createdTransactions.filter(t => t.type === 'refund').length}`);
    console.log(`  - Completed: ${createdTransactions.filter(t => t.status === 'completed').length}`);
    console.log(`  - Pending: ${createdTransactions.filter(t => t.status === 'pending').length}`);

    console.log('\nRevenue Overview:');
    console.log(`  Total Revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`  Total Commission: $${totalCommission.toFixed(2)}`);
    console.log(`  Total Refunds: $${totalRefunds.toFixed(2)}`);
    console.log(`  Net Revenue: $${(totalRevenue - totalRefunds).toFixed(2)}`);

    console.log('\nPayment Methods:');
    console.log(`  - Card: ${createdTransactions.filter(t => t.paymentMethod === 'card').length}`);
    console.log(`  - Wallet: ${createdTransactions.filter(t => t.paymentMethod === 'wallet').length}`);
    console.log(`  - Stripe: ${createdTransactions.filter(t => t.paymentMethod === 'stripe').length}`);

    console.log('\nPayouts Overview:');
    console.log(`  Total Payouts: ${createdPayouts.length}`);
    console.log(`  - Pending: ${createdPayouts.filter(p => p.status === 'pending').length} ($${pendingPayouts.toFixed(2)})`);
    console.log(`  - Approved: ${createdPayouts.filter(p => p.status === 'approved').length}`);
    console.log(`  - Completed: ${createdPayouts.filter(p => p.status === 'completed').length}`);
    console.log(`  - Processing: ${createdPayouts.filter(p => p.status === 'processing').length}`);

    console.log('\n✅ Finance & Payouts data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding finance data:', error);
    process.exit(1);
  }
};

seedFinanceData();
