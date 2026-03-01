const mongoose = require('mongoose');
const SupportTicket = require('./models/SupportTicket');
const Customer = require('./models/Customer');
const Admin = require('./models/Admin');
const Booking = require('./models/Booking');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sher-khan-limousine')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedSupportTickets = async () => {
  try {
    console.log('🎫 Starting Support Tickets Seeding...');

    // Get existing customers, admin, and bookings
    const customers = await Customer.find().limit(5);
    const admin = await Admin.findOne();
    const bookings = await Booking.find().limit(5);

    if (customers.length === 0) {
      console.log('❌ No customers found. Please seed customers first.');
      return;
    }

    if (customers.length < 3) {
      console.log(`⚠️ Only ${customers.length} customer(s) found. Need at least 3 customers.`);
      return;
    }

    if (!admin) {
      console.log('❌ No admin found. Please seed admin first.');
      return;
    }

    console.log(`✅ Found ${customers.length} customers, 1 admin, ${bookings.length} bookings`);

    // Delete existing support tickets
    await SupportTicket.deleteMany({});
    console.log('🗑️ Cleared existing support tickets');

    // Generate ticket number
    const generateTicketNumber = () => {
      return 'TKT-' + Date.now().toString().slice(-8);
    };

    // Create support tickets
    const supportTickets = [
      // Open tickets
      {
        ticketNumber: generateTicketNumber(),
        customer: customers[0]._id,
        ...(bookings[0] && { booking: bookings[0]._id }),
        subject: 'Issue with my recent booking',
        description: 'I had a booking yesterday and the chauffeur arrived 15 minutes late. This caused me to miss an important meeting. I would like to request compensation.',
        category: 'booking_issue',
        priority: 'high',
        status: 'open',
        messages: [
          {
            sender: 'customer',
            message: 'I had a booking yesterday and the chauffeur arrived 15 minutes late. This caused me to miss an important meeting. I would like to request compensation.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
          }
        ],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        ticketNumber: generateTicketNumber(),
        customer: customers[1]._id,
        ...(bookings[1] && { booking: bookings[1]._id }),
        subject: 'Payment not processing',
        description: 'I tried to make a payment for my booking but it keeps failing. I have sufficient funds in my account.',
        category: 'payment_issue',
        priority: 'urgent',
        status: 'open',
        messages: [
          {
            sender: 'customer',
            message: 'I tried to make a payment for my booking but it keeps failing. I have sufficient funds in my account.',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
          }
        ],
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        ticketNumber: generateTicketNumber(),
        customer: customers[2]._id,
        subject: 'Question about corporate accounts',
        description: 'I represent a company that needs regular chauffeur services. Do you offer corporate accounts with billing options?',
        category: 'general_inquiry',
        priority: 'medium',
        status: 'open',
        messages: [
          {
            sender: 'customer',
            message: 'I represent a company that needs regular chauffeur services. Do you offer corporate accounts with billing options?',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
          }
        ],
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },

      // In Progress tickets
      {
        ticketNumber: generateTicketNumber(),
        customer: customers[0]._id,
        ...(bookings[2] && { booking: bookings[2]._id }),
        subject: 'Chauffeur was unprofessional',
        description: 'The chauffeur was rude and did not follow my route preferences. Very disappointed with the service.',
        category: 'chauffeur_complaint',
        priority: 'high',
        status: 'in_progress',
        assignedTo: admin._id,
        messages: [
          {
            sender: 'customer',
            message: 'The chauffeur was rude and did not follow my route preferences. Very disappointed with the service.',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
          },
          {
            sender: 'admin',
            message: 'We sincerely apologize for your experience. We are investigating this matter and will take appropriate action. We will get back to you within 24 hours.',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
          }
        ],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        ticketNumber: generateTicketNumber(),
        customer: customers[1]._id,
        ...(bookings[3] && { booking: bookings[3]._id }),
        subject: 'Refund request for cancelled booking',
        description: 'My booking was cancelled due to vehicle breakdown. I was charged the full amount. Please process my refund.',
        category: 'refund_request',
        priority: 'high',
        status: 'in_progress',
        assignedTo: admin._id,
        messages: [
          {
            sender: 'customer',
            message: 'My booking was cancelled due to vehicle breakdown. I was charged the full amount. Please process my refund.',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
          },
          {
            sender: 'admin',
            message: 'Thank you for bringing this to our attention. We are processing your refund request. You should see the amount in your wallet within 2-3 business days.',
            timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000) // 7 hours ago
          }
        ],
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
      },

      // Resolved tickets
      {
        ticketNumber: generateTicketNumber(),
        customer: customers[2]._id,
        ...(bookings[4] && { booking: bookings[4]._id }),
        subject: 'Cannot access my booking history',
        description: 'The website shows an error when I try to view my past bookings.',
        category: 'technical_issue',
        priority: 'medium',
        status: 'resolved',
        assignedTo: admin._id,
        messages: [
          {
            sender: 'customer',
            message: 'The website shows an error when I try to view my past bookings.',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
          },
          {
            sender: 'admin',
            message: 'We have identified the issue. Our technical team is working on a fix.',
            timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000)
          },
          {
            sender: 'admin',
            message: 'The issue has been fixed. Please clear your browser cache and try again.',
            timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000)
          },
          {
            sender: 'customer',
            message: 'Thank you! It works now.',
            timestamp: new Date(Date.now() - 21 * 60 * 60 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 21 * 60 * 60 * 1000)
      },
      {
        ticketNumber: generateTicketNumber(),
        customer: customers[0]._id,
        subject: 'How to add a tip for the chauffeur?',
        description: 'I had an excellent experience and want to add a tip. How can I do this?',
        category: 'general_inquiry',
        priority: 'low',
        status: 'resolved',
        assignedTo: admin._id,
        messages: [
          {
            sender: 'customer',
            message: 'I had an excellent experience and want to add a tip. How can I do this?',
            timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
          },
          {
            sender: 'admin',
            message: 'Thank you for your positive feedback! You can add a tip through the booking details page after the ride is completed. There is a "Add Tip" button.',
            timestamp: new Date(Date.now() - 47 * 60 * 60 * 1000)
          },
          {
            sender: 'customer',
            message: 'Perfect, found it. Thank you!',
            timestamp: new Date(Date.now() - 46 * 60 * 60 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 46 * 60 * 60 * 1000)
      },

      // Closed tickets
      {
        ticketNumber: generateTicketNumber(),
        customer: customers[1]._id,
        ...(bookings[0] && { booking: bookings[0]._id }),
        subject: 'Received wrong invoice amount',
        description: 'The invoice shows a different amount than what was quoted.',
        category: 'payment_issue',
        priority: 'medium',
        status: 'closed',
        assignedTo: admin._id,
        messages: [
          {
            sender: 'customer',
            message: 'The invoice shows a different amount than what was quoted.',
            timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000) // 3 days ago
          },
          {
            sender: 'admin',
            message: 'Let me review your booking details and the invoice.',
            timestamp: new Date(Date.now() - 71 * 60 * 60 * 1000)
          },
          {
            sender: 'admin',
            message: 'I see the issue. There were additional wait time charges added during the trip. I have sent you a detailed breakdown via email.',
            timestamp: new Date(Date.now() - 70 * 60 * 60 * 1000)
          },
          {
            sender: 'customer',
            message: 'Got it, thank you for clarifying!',
            timestamp: new Date(Date.now() - 69 * 60 * 60 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 69 * 60 * 60 * 1000)
      },
      {
        ticketNumber: generateTicketNumber(),
        customer: customers[2]._id,
        subject: 'Update my email address',
        description: 'I need to change my registered email address.',
        category: 'general_inquiry',
        priority: 'low',
        status: 'closed',
        assignedTo: admin._id,
        messages: [
          {
            sender: 'customer',
            message: 'I need to change my registered email address to newemail@example.com',
            timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000) // 4 days ago
          },
          {
            sender: 'admin',
            message: 'Your email has been updated successfully. Please check your new email for a confirmation message.',
            timestamp: new Date(Date.now() - 95 * 60 * 60 * 1000)
          },
          {
            sender: 'customer',
            message: 'Received, thank you!',
            timestamp: new Date(Date.now() - 94 * 60 * 60 * 1000)
          }
        ],
        createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 94 * 60 * 60 * 1000)
      }
    ];

    // Insert tickets
    const insertedTickets = await SupportTicket.insertMany(supportTickets);
    
    console.log('✅ Support tickets seeded successfully!');
    console.log(`📊 Created ${insertedTickets.length} support tickets`);
    console.log('\n📈 Breakdown:');
    console.log(`   - Open: ${insertedTickets.filter(t => t.status === 'open').length}`);
    console.log(`   - In Progress: ${insertedTickets.filter(t => t.status === 'in_progress').length}`);
    console.log(`   - Resolved: ${insertedTickets.filter(t => t.status === 'resolved').length}`);
    console.log(`   - Closed: ${insertedTickets.filter(t => t.status === 'closed').length}`);
    console.log('\n🎯 Priority:');
    console.log(`   - Urgent: ${insertedTickets.filter(t => t.priority === 'urgent').length}`);
    console.log(`   - High: ${insertedTickets.filter(t => t.priority === 'high').length}`);
    console.log(`   - Medium: ${insertedTickets.filter(t => t.priority === 'medium').length}`);
    console.log(`   - Low: ${insertedTickets.filter(t => t.priority === 'low').length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding support tickets:', error);
    process.exit(1);
  }
};

seedSupportTickets();
