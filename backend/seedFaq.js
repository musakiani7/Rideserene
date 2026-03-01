const mongoose = require('mongoose');
const Faq = require('./models/Faq');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sher-khan-limousine')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const faqList = [
  { question: 'How do I book a ride?', answer: 'Select your service (e.g. Airport Transfer, City to City), enter pickup and drop-off locations, choose date and time, pick a vehicle class, and complete the booking. You can also use Quick Book from your dashboard.', category: 'booking', order: 1 },
  { question: 'Can I modify or cancel my booking?', answer: 'Yes. From the dashboard, go to Upcoming Rides, open the booking and use Edit or Cancel. Cancellations may be subject to our cancellation policy; refunds can be requested from the Refunds section.', category: 'booking', order: 2 },
  { question: 'What payment methods are accepted?', answer: 'We accept major credit and debit cards (via Stripe), wallet balance, and pay on arrival where available. Add cards in Payments & Wallet in your dashboard.', category: 'payments', order: 3 },
  { question: 'When will I receive my invoice?', answer: 'Invoices are available for completed rides. Go to Ride History or the Invoices tab and click "Download Invoice (PDF)" for any completed booking.', category: 'payments', order: 4 },
  { question: 'What is your cancellation policy?', answer: 'Cancellation terms depend on how close to the pickup time you cancel. Full details are shown at checkout. You may request a refund from the Refunds tab after cancelling.', category: 'cancellations', order: 5 },
  { question: 'How do I get a refund?', answer: 'Go to Dashboard → Refunds. You can request a refund for eligible completed or cancelled bookings. Our team will review and process according to our policy.', category: 'cancellations', order: 6 },
  { question: 'How can I contact support?', answer: 'Use the Contact Support form in your dashboard (Support tab). Choose a category, add subject and description, and submit. We will reply via the ticket thread.', category: 'general', order: 7 },
  { question: 'Can I re-book a past ride?', answer: 'Yes. In Ride History, click "Re-book" on any past ride to create a new booking with the same details (default date: tomorrow, same time).', category: 'booking', order: 8 },
];

const seedFaq = async () => {
  try {
    await Faq.deleteMany({});
    await Faq.insertMany(faqList);
    console.log(`✅ Seeded ${faqList.length} FAQ entries`);
  } catch (err) {
    console.error('FAQ seed error:', err);
  } finally {
    await mongoose.disconnect();
  }
};

seedFaq();
