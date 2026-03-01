const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');
const Chauffeur = require('./models/Chauffeur');

dotenv.config();

async function createCompletedRides() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Find a chauffeur and customer from assigned bookings
    const existingBooking = await Booking.findOne({ status: 'assigned' }).populate('customer').populate('chauffeur');
    
    if (!existingBooking || !existingBooking.customer || !existingBooking.chauffeur) {
      console.log('❌ No assigned booking found. Finding any booking with customer...');
      
      const anyBooking = await Booking.findOne({ customer: { $exists: true } }).populate('customer');
      const anyChauffeur = await Chauffeur.findOne();
      
      if (!anyBooking || !anyChauffeur) {
        console.log('❌ Could not find required data');
        process.exit(1);
      }
      
      var customerId = anyBooking.customer._id;
      var chauffeurId = anyChauffeur._id;
    } else {
      var customerId = existingBooking.customer._id;
      var chauffeurId = existingBooking.chauffeur._id;
    }

    console.log('\n📋 Creating completed rides for chauffeur:', chauffeurId);

    // Create completed rides for the past month
    const completedRides = [];
    const today = new Date();

    for (let i = 1; i <= 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const ride = {
        customer: customerId,
        chauffeur: chauffeurId,
        bookingReference: `BK-COMP-${Date.now()}-${i}`,
        rideType: 'hourly',
        pickupLocation: {
          address: `Pickup Location ${i}`,
          coordinates: { lat: 33.6844, lng: 73.0479 }
        },
        dropoffLocation: {
          address: `Dropoff Location ${i}`,
          coordinates: { lat: 33.5651, lng: 73.0169 }
        },
        pickupDate: date,
        pickupTime: `${10 + (i % 12)}:00`,
        duration: 4,
        vehicleClass: {
          name: i % 3 === 0 ? 'Luxury SUV' : i % 2 === 0 ? 'Business Sedan' : 'Executive Van',
          vehicle: i % 3 === 0 ? 'Range Rover' : i % 2 === 0 ? 'Mercedes S-Class' : 'Mercedes V-Class',
          basePrice: i % 3 === 0 ? 150 : i % 2 === 0 ? 120 : 200
        },
        passengerInfo: {
          firstName: 'Test',
          lastName: `Passenger ${i}`,
          email: `test${i}@example.com`,
          phone: `03001234${String(i).padStart(3, '0')}`
        },
        basePrice: (100 + (i * 10)),
        totalPrice: (100 + (i * 10)),
        status: 'completed',
        paymentMethod: 'credit_card',
        paymentStatus: 'completed'
      };

      completedRides.push(ride);
    }

    const result = await Booking.insertMany(completedRides);
    console.log(`✅ Created ${result.length} completed rides`);

    // Calculate total earnings
    const totalEarnings = completedRides.reduce((sum, ride) => sum + ride.totalPrice, 0);
    console.log(`💰 Total earnings from test rides: $${totalEarnings.toFixed(2)}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createCompletedRides();
