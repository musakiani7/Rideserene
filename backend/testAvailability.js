require('dotenv').config();
const mongoose = require('mongoose');
const Chauffeur = require('./models/Chauffeur');

const testAvailability = async () => {
  try {
    console.log('🔍 Testing Availability System...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sher-khan-limousine');
    console.log('✅ Connected to MongoDB\n');

    // Find a chauffeur
    const chauffeur = await Chauffeur.findOne();
    if (!chauffeur) {
      console.log('❌ No chauffeur found. Please create a chauffeur first.');
      process.exit(1);
    }

    console.log('✅ Found chauffeur:', chauffeur.firstName, chauffeur.lastName);
    console.log('   Email:', chauffeur.email);
    console.log('   ID:', chauffeur._id);
    console.log('   Online Status:', chauffeur.isOnline ? '🟢 Online' : '🔴 Offline');
    console.log();

    // Check existing availability
    console.log('📅 Current Availability:\n');
    if (chauffeur.availability) {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      days.forEach(day => {
        const dayData = chauffeur.availability[day];
        if (dayData && dayData.enabled) {
          console.log(`   ✅ ${day.charAt(0).toUpperCase() + day.slice(1)}: ${dayData.startTime} - ${dayData.endTime}`);
        } else {
          console.log(`   ⬜ ${day.charAt(0).toUpperCase() + day.slice(1)}: Off`);
        }
      });
    } else {
      console.log('   No availability schedule set yet');
    }
    console.log();

    // Test updating availability
    console.log('🔄 Testing availability update...');
    const testAvailability = {
      monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      sunday: { enabled: false, startTime: '09:00', endTime: '17:00' }
    };

    chauffeur.availability = testAvailability;
    await chauffeur.save();

    console.log('✅ Availability updated successfully!\n');

    // Display updated schedule
    console.log('📅 Updated Availability (Weekdays 9-5):\n');
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
      const dayData = chauffeur.availability[day];
      if (dayData.enabled) {
        console.log(`   ✅ ${day.charAt(0).toUpperCase() + day.slice(1)}: ${dayData.startTime} - ${dayData.endTime}`);
      } else {
        console.log(`   ⬜ ${day.charAt(0).toUpperCase() + day.slice(1)}: Off`);
      }
    });
    console.log();

    // API endpoints summary
    console.log('📡 Available API Endpoints:\n');
    console.log('GET    /api/chauffeur/dashboard/availability');
    console.log('       - Fetch chauffeur availability schedule');
    console.log('       - Returns: availability object with all days\n');
    
    console.log('PUT    /api/chauffeur/dashboard/availability');
    console.log('       - Update chauffeur availability schedule');
    console.log('       - Body: { availability: { monday: {...}, tuesday: {...}, ... } }');
    console.log('       - Returns: updated availability\n');

    // Database schema info
    console.log('📊 Database Schema:\n');
    console.log('Chauffeur.availability = {');
    console.log('  monday: { enabled: Boolean, startTime: String, endTime: String },');
    console.log('  tuesday: { enabled: Boolean, startTime: String, endTime: String },');
    console.log('  wednesday: { enabled: Boolean, startTime: String, endTime: String },');
    console.log('  thursday: { enabled: Boolean, startTime: String, endTime: String },');
    console.log('  friday: { enabled: Boolean, startTime: String, endTime: String },');
    console.log('  saturday: { enabled: Boolean, startTime: String, endTime: String },');
    console.log('  sunday: { enabled: Boolean, startTime: String, endTime: String }');
    console.log('}\n');

    console.log('✅ Availability system test complete!\n');

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

testAvailability();
