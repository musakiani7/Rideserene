const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');

dotenv.config();

async function testApproveRide() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Find a pending ride
    const pendingRide = await Booking.findOne({ status: 'pending' })
      .populate('customer', 'firstName lastName')
      .populate('chauffeur', 'firstName lastName');

    if (!pendingRide) {
      console.log('❌ No pending rides found');
      process.exit(0);
    }

    console.log('\n📋 Found pending ride:');
    console.log('  Reference:', pendingRide.bookingReference);
    console.log('  Status:', pendingRide.status);
    console.log('  Customer:', pendingRide.customer?.firstName, pendingRide.customer?.lastName);
    console.log('  Chauffeur:', pendingRide.chauffeur ? `${pendingRide.chauffeur.firstName} ${pendingRide.chauffeur.lastName}` : 'Not assigned');

    console.log('\n✅ Ready to test! Use this ride ID to test approval:', pendingRide._id);
    console.log('Booking Reference:', pendingRide.bookingReference);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testApproveRide();
