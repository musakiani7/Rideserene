const mongoose = require('mongoose');
const Review = require('./models/Review');
const Chauffeur = require('./models/Chauffeur');
const Customer = require('./models/Customer');
const Booking = require('./models/Booking');

mongoose.connect('mongodb://localhost:27017/rideserene')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedReviews = async () => {
  try {
    // Find an approved chauffeur
    const chauffeur = await Chauffeur.findOne({ status: 'approved' });
    
    if (!chauffeur) {
      console.log('No approved chauffeur found. Please create and approve a chauffeur first.');
      process.exit(0);
    }

    // Find or create a customer
    let customer = await Customer.findOne();
    
    if (!customer) {
      console.log('No customer found. Creating sample customer...');
      customer = await Customer.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        password: 'password123',
        isVerified: true
      });
    }

    // Find or create a booking
    let booking = await Booking.findOne({ 
      customer: customer._id 
    });

    if (!booking) {
      console.log('No booking found. Creating sample booking...');
      booking = await Booking.create({
        customer: customer._id,
        chauffeur: chauffeur._id,
        rideType: 'one-way',
        pickupLocation: {
          address: '123 Main St, Dubai, UAE'
        },
        dropoffLocation: {
          address: '456 Beach Rd, Dubai, UAE'
        },
        pickupDate: new Date(),
        pickupTime: '10:00',
        status: 'completed',
        paymentStatus: 'paid',
        fare: {
          subtotal: 150,
          tax: 15,
          total: 165
        }
      });
    }

    // Delete existing reviews for this chauffeur
    await Review.deleteMany({ chauffeur: chauffeur._id });
    console.log('Deleted existing reviews');

    // Create sample reviews
    const sampleReviews = [
      {
        booking: booking._id,
        chauffeur: chauffeur._id,
        customer: customer._id,
        rating: 5,
        comment: 'Excellent service! The driver was very professional and punctual. The car was spotless and the ride was smooth. Highly recommended!',
        categories: {
          professionalism: 5,
          punctuality: 5,
          vehicleCondition: 5,
          communication: 5,
          drivingSkills: 5
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        booking: booking._id,
        chauffeur: chauffeur._id,
        customer: customer._id,
        rating: 4,
        comment: 'Great experience overall. Driver was friendly and the car was comfortable. Arrived a few minutes late but called ahead to inform us.',
        categories: {
          professionalism: 5,
          punctuality: 3,
          vehicleCondition: 4,
          communication: 5,
          drivingSkills: 4
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        booking: booking._id,
        chauffeur: chauffeur._id,
        customer: customer._id,
        rating: 5,
        comment: 'Perfect ride! The chauffeur was courteous, the vehicle was luxurious, and we arrived on time. Will definitely book again.',
        categories: {
          professionalism: 5,
          punctuality: 5,
          vehicleCondition: 5,
          communication: 4,
          drivingSkills: 5
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        booking: booking._id,
        chauffeur: chauffeur._id,
        customer: customer._id,
        rating: 4,
        comment: 'Very good service. Driver was professional and knew all the routes. Car was clean and comfortable.',
        categories: {
          professionalism: 4,
          punctuality: 4,
          vehicleCondition: 4,
          communication: 4,
          drivingSkills: 5
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        booking: booking._id,
        chauffeur: chauffeur._id,
        customer: customer._id,
        rating: 5,
        comment: 'Outstanding! Best limousine service in Dubai. The driver went above and beyond to ensure our comfort.',
        categories: {
          professionalism: 5,
          punctuality: 5,
          vehicleCondition: 5,
          communication: 5,
          drivingSkills: 5
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        booking: booking._id,
        chauffeur: chauffeur._id,
        customer: customer._id,
        rating: 3,
        comment: 'Good service but the car could have been cleaner. Driver was nice though.',
        categories: {
          professionalism: 4,
          punctuality: 4,
          vehicleCondition: 2,
          communication: 4,
          drivingSkills: 4
        },
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000) // 10 hours ago
      }
    ];

    const createdReviews = await Review.insertMany(sampleReviews);
    console.log(`✅ Created ${createdReviews.length} sample reviews for chauffeur: ${chauffeur.firstName} ${chauffeur.lastName}`);

    // Update chauffeur's rating
    const avgRating = sampleReviews.reduce((sum, r) => sum + r.rating, 0) / sampleReviews.length;
    await Chauffeur.findByIdAndUpdate(chauffeur._id, {
      rating: Math.round(avgRating * 10) / 10,
      totalRatings: sampleReviews.length
    });

    console.log(`✅ Updated chauffeur rating to ${Math.round(avgRating * 10) / 10} with ${sampleReviews.length} reviews`);
    console.log('\n📊 Sample Reviews Summary:');
    console.log(`   5 stars: ${sampleReviews.filter(r => r.rating === 5).length}`);
    console.log(`   4 stars: ${sampleReviews.filter(r => r.rating === 4).length}`);
    console.log(`   3 stars: ${sampleReviews.filter(r => r.rating === 3).length}`);
    console.log(`   Average: ${Math.round(avgRating * 10) / 10}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding reviews:', error);
    process.exit(1);
  }
};

seedReviews();
