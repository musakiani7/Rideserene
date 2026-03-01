require('dotenv').config();
const mongoose = require('mongoose');
const Chauffeur = require('./models/Chauffeur');
const Booking = require('./models/Booking');
const Payout = require('./models/Payout');

const testPayoutSystem = async () => {
  try {
    console.log('🔍 Testing Payout System...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sher-khan-limousine');
    console.log('✅ Connected to MongoDB\n');

    // 1. Find a chauffeur with completed rides
    const chauffeur = await Chauffeur.findOne();
    if (!chauffeur) {
      console.log('❌ No chauffeur found. Please create a chauffeur first.');
      process.exit(1);
    }
    console.log('✅ Found chauffeur:', chauffeur.firstName, chauffeur.lastName);
    console.log('   Email:', chauffeur.email);
    console.log('   ID:', chauffeur._id, '\n');

    // 2. Get completed rides for the chauffeur
    const completedRides = await Booking.find({
      chauffeur: chauffeur._id,
      status: 'completed',
    }).sort({ completedAt: -1 });

    console.log('✅ Found', completedRides.length, 'completed rides');
    if (completedRides.length > 0) {
      const total = completedRides.reduce((sum, ride) => sum + ride.totalPrice, 0);
      console.log('   Total earnings: $' + total.toFixed(2));
      console.log('   Date range:', 
        completedRides[completedRides.length - 1].pickupDate.toISOString().split('T')[0],
        'to',
        completedRides[0].pickupDate.toISOString().split('T')[0]
      );
      console.log('\n   Sample rides:');
      completedRides.slice(0, 5).forEach((ride, i) => {
        console.log(`   ${i + 1}. ${ride.bookingReference} - $${ride.totalPrice} - ${ride.pickupDate.toISOString().split('T')[0]}`);
      });
    }
    console.log();

    // 3. Calculate available balance (rides not in any completed/processing payout)
    const paidPayouts = await Payout.find({
      chauffeur: chauffeur._id,
      status: { $in: ['completed', 'processing'] },
    }).select('rides');

    const paidRideIds = new Set();
    paidPayouts.forEach(payout => {
      payout.rides.forEach(rideId => paidRideIds.add(rideId.toString()));
    });

    const unpaidRides = completedRides.filter(
      ride => !paidRideIds.has(ride._id.toString())
    );

    const grossAmount = unpaidRides.reduce((sum, ride) => sum + ride.totalPrice, 0);
    const commission = (grossAmount * 15) / 100;
    const availableBalance = grossAmount - commission;

    console.log('💰 Available Balance:');
    console.log('   Unpaid rides:', unpaidRides.length);
    console.log('   Gross amount: $' + grossAmount.toFixed(2));
    console.log('   Commission (15%): -$' + commission.toFixed(2));
    console.log('   Net available: $' + availableBalance.toFixed(2), '\n');

    // 4. Get existing payouts
    const existingPayouts = await Payout.find({ chauffeur: chauffeur._id })
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('📋 Existing Payouts:', existingPayouts.length);
    if (existingPayouts.length > 0) {
      console.log('\n   Recent payouts:');
      existingPayouts.forEach((payout, i) => {
        console.log(`   ${i + 1}. $${payout.netAmount.toFixed(2)} - ${payout.status} - ${payout.rideCount} rides - ${payout.createdAt.toISOString().split('T')[0]}`);
      });
    }
    console.log();

    // 5. Payout statistics by status
    const payoutStats = await Payout.aggregate([
      { $match: { chauffeur: chauffeur._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$netAmount' },
        },
      },
    ]);

    if (payoutStats.length > 0) {
      console.log('📊 Payout Statistics:');
      payoutStats.forEach(stat => {
        console.log(`   ${stat._id}: ${stat.count} payouts - Total: $${stat.totalAmount.toFixed(2)}`);
      });
      console.log();
    }

    // 6. Create a test payout if there are unpaid rides
    if (unpaidRides.length > 0 && availableBalance > 0) {
      console.log('🔄 Creating test payout...');
      
      const periodStart = unpaidRides[unpaidRides.length - 1].completedAt || unpaidRides[unpaidRides.length - 1].pickupDate;
      const periodEnd = unpaidRides[0].completedAt || unpaidRides[0].pickupDate;
      
      const testPayout = await Payout.create({
        chauffeur: chauffeur._id,
        amount: availableBalance,
        grossAmount,
        netAmount: availableBalance,
        commission,
        commissionPercentage: 15,
        periodStart,
        periodEnd,
        paymentMethod: 'bank_transfer',
        bankDetails: {
          accountHolderName: `${chauffeur.firstName} ${chauffeur.lastName}`,
          accountNumber: '****1234',
          bankName: 'Test Bank',
          routingNumber: '123456789',
        },
        rides: unpaidRides.map(ride => ride._id),
        rideCount: unpaidRides.length,
        status: 'pending',
      });

      console.log('✅ Test payout created:');
      console.log('   ID:', testPayout._id);
      console.log('   Amount: $' + testPayout.netAmount.toFixed(2));
      console.log('   Rides:', testPayout.rideCount);
      console.log('   Status:', testPayout.status);
      console.log('   Period:', periodStart.toISOString().split('T')[0], 'to', periodEnd.toISOString().split('T')[0]);
    } else {
      console.log('ℹ️  No unpaid rides available for test payout\n');
    }

    // 7. Test API endpoints summary
    console.log('\n📡 Available API Endpoints:\n');
    console.log('Chauffeur Endpoints:');
    console.log('  POST   /api/chauffeur/dashboard/payouts/request');
    console.log('  GET    /api/chauffeur/dashboard/payouts');
    console.log('  GET    /api/chauffeur/dashboard/payouts/available-balance');
    console.log('  GET    /api/chauffeur/dashboard/payouts/:id');
    console.log('  PUT    /api/chauffeur/dashboard/payouts/:id/cancel');
    console.log();
    console.log('Admin Endpoints:');
    console.log('  GET    /api/admin/payouts');
    console.log('  GET    /api/admin/payouts/stats');
    console.log('  GET    /api/admin/payouts/:id');
    console.log('  PUT    /api/admin/payouts/:id/approve');
    console.log('  PUT    /api/admin/payouts/:id/complete');
    console.log('  PUT    /api/admin/payouts/:id/reject');
    console.log();

    console.log('✅ Payout system test complete!\n');

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

testPayoutSystem();
