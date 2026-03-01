const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');
const Chauffeur = require('./models/Chauffeur');

dotenv.config();

const checkUpcomingRides = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Checking for upcoming rides...\n');
    console.log('Today:', today.toLocaleDateString(), '\n');

    // Check all bookings
    const allBookings = await Booking.find().select('bookingReference status pickupDate pickupTime');
    console.log(`Total bookings in database: ${allBookings.length}\n`);

    // Check upcoming rides
    const upcomingRides = await Booking.find({
      pickupDate: { $gte: today },
      status: { $in: ['pending', 'confirmed', 'assigned'] },
    })
      .populate('customer', 'firstName lastName email phone')
      .populate('chauffeur', 'firstName lastName phone')
      .sort({ pickupDate: 1, pickupTime: 1 });

    console.log(`✅ Upcoming rides (pending/confirmed/assigned): ${upcomingRides.length}\n`);

    if (upcomingRides.length > 0) {
      upcomingRides.forEach((ride, index) => {
        console.log(`Ride ${index + 1}:`);
        console.log(`  Reference: ${ride.bookingReference}`);
        console.log(`  Status: ${ride.status}`);
        console.log(`  Date: ${new Date(ride.pickupDate).toLocaleDateString()}`);
        console.log(`  Time: ${ride.pickupTime}`);
        console.log(`  Customer: ${ride.customer?.firstName} ${ride.customer?.lastName}`);
        console.log(`  Chauffeur: ${ride.chauffeur ? `${ride.chauffeur.firstName} ${ride.chauffeur.lastName}` : 'Not assigned'}`);
        console.log('');
      });
    } else {
      console.log('ℹ️  No upcoming rides found with pending/confirmed/assigned status\n');
      
      // Check what statuses exist
      const statusCounts = await Booking.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      console.log('Booking status distribution:');
      statusCounts.forEach(item => {
        console.log(`  ${item._id}: ${item.count}`);
      });
      
      // Check future bookings regardless of status
      console.log('\n📅 All future bookings (any status):');
      const futureBookings = await Booking.find({
        pickupDate: { $gte: today }
      }).select('bookingReference status pickupDate');
      
      console.log(`Found ${futureBookings.length} future bookings\n`);
      futureBookings.slice(0, 5).forEach(b => {
        console.log(`  ${b.bookingReference} - ${b.status} - ${new Date(b.pickupDate).toLocaleDateString()}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkUpcomingRides();
