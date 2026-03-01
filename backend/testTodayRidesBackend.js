const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');
const Chauffeur = require('./models/Chauffeur');
const Customer = require('./models/Customer');

dotenv.config();

async function testTodayRidesBackend() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Get a chauffeur
    const chauffeur = await Chauffeur.findOne();
    if (!chauffeur) {
      console.log('❌ No chauffeur found');
      process.exit(1);
    }

    console.log('👨‍✈️ Testing with chauffeur:', chauffeur.firstName, chauffeur.lastName);
    console.log('   Chauffeur ID:', chauffeur._id, '\n');

    // Test 1: Get Today's Rides
    console.log('📋 Test 1: Today\'s Rides');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRides = await Booking.find({
      pickupDate: { $gte: today },
      status: { $in: ['pending', 'confirmed', 'assigned'] },
    })
      .populate('customer', 'firstName lastName')
      .populate('chauffeur', 'firstName lastName')
      .sort({ pickupDate: 1, pickupTime: 1 })
      .limit(10);

    console.log(`   Found ${todayRides.length} upcoming rides:`);
    todayRides.forEach((ride, i) => {
      console.log(`   ${i + 1}. ${ride.bookingReference} - ${ride.status} - ${ride.customer?.firstName} ${ride.customer?.lastName}`);
      console.log(`      Chauffeur: ${ride.chauffeur ? `${ride.chauffeur.firstName} ${ride.chauffeur.lastName}` : 'Not assigned'}`);
      console.log(`      Date: ${ride.pickupDate.toLocaleDateString()} at ${ride.pickupTime}`);
    });

    // Test 2: Ride Statistics
    console.log('\n📊 Test 2: Ride Statistics');
    const stats = await Booking.aggregate([
      {
        $match: {
          chauffeur: chauffeur._id,
        },
      },
      {
        $facet: {
          total: [{ $count: 'count' }],
          completed: [
            { $match: { status: 'completed' } },
            { $count: 'count' }
          ],
          inProgress: [
            { $match: { status: 'in-progress' } },
            { $count: 'count' }
          ],
          upcoming: [
            { 
              $match: { 
                status: { $in: ['assigned', 'confirmed'] },
                pickupDate: { $gte: today }
              } 
            },
            { $count: 'count' }
          ],
          assigned: [
            { $match: { status: 'assigned' } },
            { $count: 'count' }
          ],
          pending: [
            { $match: { status: 'pending' } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    console.log('   Total Rides:', stats[0].total[0]?.count || 0);
    console.log('   Completed:', stats[0].completed[0]?.count || 0);
    console.log('   In Progress:', stats[0].inProgress[0]?.count || 0);
    console.log('   Upcoming:', stats[0].upcoming[0]?.count || 0);
    console.log('   Assigned to Chauffeur:', stats[0].assigned[0]?.count || 0);
    console.log('   Pending:', stats[0].pending[0]?.count || 0);

    // Test 3: Find rides assigned to this chauffeur
    console.log('\n🚗 Test 3: Rides Assigned to Chauffeur');
    const assignedRides = await Booking.find({
      chauffeur: chauffeur._id,
      status: { $in: ['assigned', 'confirmed', 'in-progress'] }
    })
      .populate('customer', 'firstName lastName phone')
      .sort({ pickupDate: 1 });

    console.log(`   Found ${assignedRides.length} assigned rides:`);
    assignedRides.forEach((ride, i) => {
      console.log(`   ${i + 1}. ${ride.bookingReference} - ${ride.status}`);
      console.log(`      Customer: ${ride.customer?.firstName} ${ride.customer?.lastName} (${ride.customer?.phone})`);
      console.log(`      Pickup: ${ride.pickupLocation?.address}`);
      console.log(`      Dropoff: ${ride.dropoffLocation?.address}`);
      console.log(`      Date: ${ride.pickupDate.toLocaleDateString()} at ${ride.pickupTime}`);
      console.log(`      Price: $${ride.totalPrice.toFixed(2)}`);
    });

    // Test 4: Check ride lifecycle tracking fields
    console.log('\n⏱️  Test 4: Ride Lifecycle Fields');
    const rideWithTracking = await Booking.findOne({
      chauffeur: chauffeur._id,
      status: 'completed'
    });

    if (rideWithTracking) {
      console.log('   Sample completed ride:', rideWithTracking.bookingReference);
      console.log('   Created At:', rideWithTracking.createdAt);
      console.log('   Assigned At:', rideWithTracking.assignedAt || 'N/A');
      console.log('   Started At:', rideWithTracking.startedAt || 'N/A');
      console.log('   Completed At:', rideWithTracking.completedAt || 'N/A');
      console.log('   Actual End Time:', rideWithTracking.actualEndTime || 'N/A');
    } else {
      console.log('   No completed rides found for lifecycle tracking test');
    }

    // Test 5: Available API Endpoints Summary
    console.log('\n🔌 Test 5: Available API Endpoints');
    console.log('   GET  /api/chauffeur/dashboard/today-rides       - Get all upcoming rides');
    console.log('   GET  /api/chauffeur/dashboard/ride-stats        - Get ride statistics');
    console.log('   GET  /api/chauffeur/dashboard/rides/:id         - Get single ride details');
    console.log('   PUT  /api/chauffeur/dashboard/rides/:id/approve - Approve a pending ride');
    console.log('   PUT  /api/chauffeur/dashboard/rides/:id/start   - Start an assigned ride');
    console.log('   PUT  /api/chauffeur/dashboard/rides/:id/complete - Complete an in-progress ride');
    console.log('   PUT  /api/chauffeur/dashboard/rides/:id/cancel  - Cancel an assigned ride');
    console.log('   PUT  /api/chauffeur/dashboard/rides/:id/status  - Update ride status');

    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testTodayRidesBackend();
