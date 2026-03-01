const mongoose = require('mongoose');
const Booking = require('./models/Booking');
require('dotenv').config();

async function testRideRequests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rideserene');
    console.log('✅ Connected to MongoDB');

    // Find all pending bookings
    const allPending = await Booking.find({ status: 'pending' }).lean();
    console.log(`\n📊 Total pending bookings: ${allPending.length}`);
    
    if (allPending.length > 0) {
      console.log('\n📋 Pending bookings:');
      allPending.forEach((booking, idx) => {
        console.log(`\n${idx + 1}. Booking Reference: ${booking.bookingReference}`);
        console.log(`   ID: ${booking._id}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Chauffeur: ${booking.chauffeur || 'NOT SET (null/undefined)'}`);
        console.log(`   Chauffeur exists?: ${booking.chauffeur !== undefined ? 'YES' : 'NO'}`);
        console.log(`   Declined by: ${booking.declinedByChauffeurs?.length || 0} chauffeurs`);
        console.log(`   Customer: ${booking.customer}`);
        console.log(`   Pickup: ${booking.pickupLocation?.address || 'N/A'}`);
        console.log(`   Created: ${booking.createdAt}`);
      });
    }

    // Test the query that chauffeurs use
    const chauffeurId = new mongoose.Types.ObjectId(); // Dummy ID for testing
    const query = {
      status: 'pending',
      $and: [
        {
          $or: [
            { chauffeur: { $exists: false } },
            { chauffeur: null },
          ],
        },
        {
          $or: [
            { declinedByChauffeurs: { $exists: false } },
            { declinedByChauffeurs: [] },
            { declinedByChauffeurs: { $nin: [chauffeurId] } },
          ],
        },
      ],
    };

    console.log('\n🔍 Testing query for ride requests:');
    console.log(JSON.stringify(query, null, 2));

    const requests = await Booking.find(query).lean();
    console.log(`\n✅ Query returned ${requests.length} ride requests`);
    
    if (requests.length > 0) {
      console.log('\n📋 Ride requests that should show:');
      requests.forEach((booking, idx) => {
        console.log(`${idx + 1}. ${booking.bookingReference} - ${booking.pickupLocation?.address || 'N/A'}`);
      });
    } else {
      console.log('\n❌ No ride requests found!');
      console.log('\n🔍 Checking why...');
      
      // Check each condition
      const withStatusPending = await Booking.countDocuments({ status: 'pending' });
      console.log(`   - Bookings with status 'pending': ${withStatusPending}`);
      
      const withNoChauffeur = await Booking.countDocuments({
        status: 'pending',
        $or: [
          { chauffeur: { $exists: false } },
          { chauffeur: null },
        ],
      });
      console.log(`   - Bookings with status 'pending' AND no chauffeur: ${withNoChauffeur}`);
      
      const withNoDeclined = await Booking.countDocuments({
        status: 'pending',
        $or: [
          { chauffeur: { $exists: false } },
          { chauffeur: null },
        ],
        $or: [
          { declinedByChauffeurs: { $exists: false } },
          { declinedByChauffeurs: [] },
        ],
      });
      console.log(`   - Bookings matching all conditions: ${withNoDeclined}`);
    }

    // Check for the specific booking mentioned
    const specificBooking = await Booking.findOne({ bookingReference: 'BK-MLILHAZO-489M' }).lean();
    if (specificBooking) {
      console.log('\n🎯 Found specific booking BK-MLILHAZO-489M:');
      console.log(`   Status: ${specificBooking.status}`);
      console.log(`   Chauffeur: ${specificBooking.chauffeur || 'NOT SET'}`);
      console.log(`   Chauffeur type: ${typeof specificBooking.chauffeur}`);
      console.log(`   Chauffeur === null: ${specificBooking.chauffeur === null}`);
      console.log(`   Chauffeur === undefined: ${specificBooking.chauffeur === undefined}`);
      console.log(`   Declined by: ${specificBooking.declinedByChauffeurs?.length || 0}`);
      
      // Test if it matches the query
      const matchesQuery = await Booking.findOne({
        _id: specificBooking._id,
        ...query,
      }).lean();
      console.log(`   Matches query: ${matchesQuery ? 'YES ✅' : 'NO ❌'}`);
    } else {
      console.log('\n❌ Booking BK-MLILHAZO-489M not found in database');
    }

    await mongoose.disconnect();
    console.log('\n✅ Test complete');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testRideRequests();
