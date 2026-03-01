const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');
const Chauffeur = require('./models/Chauffeur');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const seedBookings = async () => {
  try {
    await connectDB();

    // Get existing customers and chauffeurs
    const customers = await Customer.find().limit(5);
    const chauffeurs = await Chauffeur.find({ status: 'approved' }).limit(5);

    if (customers.length === 0) {
      console.log('No customers found. Please create customers first.');
      process.exit(1);
    }

    console.log(`Found ${customers.length} customers and ${chauffeurs.length} chauffeurs`);

    // Clear existing bookings (optional - comment out if you want to keep existing data)
    // await Booking.deleteMany({});
    // console.log('Cleared existing bookings');

    const statuses = ['pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled'];
    const rideTypes = ['one-way', 'round-trip', 'by-hour', 'airport-transfer', 'city-to-city'];
    const vehicleClasses = [
      { name: 'Executive Sedan', vehicle: 'Mercedes S-Class', passengers: 3, luggage: 2, basePrice: 120 },
      { name: 'Luxury SUV', vehicle: 'BMW X7', passengers: 6, luggage: 4, basePrice: 180 },
      { name: 'Premium Sedan', vehicle: 'Audi A8', passengers: 3, luggage: 2, basePrice: 150 },
      { name: 'Executive Van', vehicle: 'Mercedes V-Class', passengers: 7, luggage: 6, basePrice: 200 },
      { name: 'Business Class', vehicle: 'Tesla Model S', passengers: 4, luggage: 2, basePrice: 140 },
    ];

    const locations = [
      { address: '123 Main St, New York, NY 10001', lat: 40.7128, lng: -74.0060 },
      { address: '456 Park Ave, Manhattan, NY 10022', lat: 40.7614, lng: -73.9776 },
      { address: 'JFK International Airport, Queens, NY 11430', lat: 40.6413, lng: -73.7781 },
      { address: 'Times Square, New York, NY 10036', lat: 40.7580, lng: -73.9855 },
      { address: '789 Broadway, Brooklyn, NY 11211', lat: 40.7081, lng: -73.9571 },
      { address: 'Central Park West, New York, NY 10024', lat: 40.7794, lng: -73.9632 },
      { address: 'Wall Street, Financial District, NY 10005', lat: 40.7074, lng: -74.0113 },
      { address: 'LaGuardia Airport, Queens, NY 11371', lat: 40.7769, lng: -73.8740 },
    ];

    const bookings = [];

    // Generate 20 sample bookings
    for (let i = 0; i < 20; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const vehicleClass = vehicleClasses[Math.floor(Math.random() * vehicleClasses.length)];
      const rideType = rideTypes[Math.floor(Math.random() * rideTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const pickupLocation = locations[Math.floor(Math.random() * locations.length)];
      const dropoffLocation = locations[Math.floor(Math.random() * locations.length)];

      // Generate random date within the next 30 days
      const daysOffset = Math.floor(Math.random() * 30) - 10; // -10 to 20 days
      const pickupDate = new Date();
      pickupDate.setDate(pickupDate.getDate() + daysOffset);
      pickupDate.setHours(Math.floor(Math.random() * 14) + 7, 0, 0, 0); // Random hour between 7 AM and 9 PM

      const hour = pickupDate.getHours();
      const pickupTime = `${hour.toString().padStart(2, '0')}:00`;

      const basePrice = vehicleClass.basePrice + Math.floor(Math.random() * 50);
      const taxes = basePrice * 0.1;
      const fees = 15;
      const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0;
      const totalPrice = basePrice + taxes + fees - discount;

      const booking = {
        customer: customer._id,
        rideType,
        pickupLocation: {
          address: pickupLocation.address,
          coordinates: { lat: pickupLocation.lat, lng: pickupLocation.lng },
        },
        dropoffLocation: rideType !== 'by-hour' ? {
          address: dropoffLocation.address,
          coordinates: { lat: dropoffLocation.lat, lng: dropoffLocation.lng },
        } : undefined,
        pickupDate,
        pickupTime,
        duration: rideType === 'by-hour' ? Math.floor(Math.random() * 6) + 2 : undefined,
        estimatedDistance: rideType !== 'by-hour' ? Math.floor(Math.random() * 30) + 5 : undefined,
        vehicleClass: {
          name: vehicleClass.name,
          vehicle: vehicleClass.vehicle,
          passengers: vehicleClass.passengers,
          luggage: vehicleClass.luggage,
          basePrice: vehicleClass.basePrice,
        },
        passengerInfo: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          flightNumber: rideType === 'airport-transfer' ? `AA${Math.floor(Math.random() * 9000) + 1000}` : undefined,
          specialRequests: Math.random() > 0.7 ? 'Please ensure vehicle is clean and comfortable' : undefined,
        },
        basePrice,
        taxes,
        fees,
        discount,
        totalPrice,
        paymentStatus: status === 'completed' ? 'completed' : status === 'cancelled' ? 'refunded' : 'pending',
        paymentMethod: 'credit_card',
        status,
      };

      // Assign chauffeur if status is not pending
      if (status !== 'pending' && chauffeurs.length > 0) {
        booking.chauffeur = chauffeurs[Math.floor(Math.random() * chauffeurs.length)]._id;
        booking.assignedAt = new Date(pickupDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before pickup
      }

      // Add completion details if completed
      if (status === 'completed') {
        booking.startedAt = pickupDate;
        booking.completedAt = new Date(pickupDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours after start
        booking.paidAt = booking.completedAt;
      }

      // Add cancellation details if cancelled
      if (status === 'cancelled') {
        booking.cancellationReason = 'Customer requested cancellation';
        booking.cancelledAt = new Date(pickupDate.getTime() - 12 * 60 * 60 * 1000); // 12 hours before pickup
      }

      bookings.push(booking);
    }

    // Insert bookings one by one to trigger pre-save hooks
    for (const booking of bookings) {
      await Booking.create(booking);
    }
    console.log(`✅ Successfully created ${bookings.length} sample bookings`);

    // Display statistics
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    console.log('\n📊 Booking Statistics:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    console.log('\n✅ Ride Management data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding bookings:', error);
    process.exit(1);
  }
};

seedBookings();
