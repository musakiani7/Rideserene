/**
 * Check why a chauffeur login might fail.
 * Usage: node checkChauffeurLogin.js <email> [password]
 * Example: node checkChauffeurLogin.js ajmal@gmail.com ajmal12
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Chauffeur = require('./models/Chauffeur');

const email = process.argv[2];
const password = process.argv[3];

if (!email) {
  console.log('Usage: node checkChauffeurLogin.js <email> [password]');
  console.log('Example: node checkChauffeurLogin.js ajmal@gmail.com ajmal12');
  process.exit(1);
}

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }

  try {
    const chauffeur = await Chauffeur.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!chauffeur) {
      console.log('\n❌ No chauffeur found with email:', email);
      console.log('   → Register first via the Become a Chauffeur form, then have an admin approve the account.\n');
      process.exit(0);
      return;
    }

    console.log('\n✅ Chauffeur found:', chauffeur.email);
    console.log('   Name:', chauffeur.firstName, chauffeur.lastName);
    console.log('   Status:', chauffeur.status);
    console.log('   isActive:', chauffeur.isActive);
    console.log('   isVerified:', chauffeur.isVerified);
    if (chauffeur.approvedAt) console.log('   approvedAt:', chauffeur.approvedAt);

    if (chauffeur.status === 'pending') {
      console.log('\n⚠️  Login will fail: status is "pending".');
      console.log('   → An admin must approve this chauffeur in the Admin Dashboard (Chauffeurs → Approve).\n');
    } else if (chauffeur.status === 'rejected') {
      console.log('\n⚠️  Login will fail: application was rejected.');
      if (chauffeur.rejectionReason) console.log('   Reason:', chauffeur.rejectionReason);
      console.log('');
    } else if (chauffeur.status === 'suspended') {
      console.log('\n⚠️  Login will fail: account is suspended.\n');
    } else if (!chauffeur.isActive) {
      console.log('\n⚠️  Login will fail: isActive is false.');
      console.log('   → Admin should set the chauffeur to active (or re-approve).\n');
    }

    if (password) {
      const match = await chauffeur.comparePassword(password);
      if (match) {
        console.log('   Password check: ✅ Matches');
      } else {
        console.log('   Password check: ❌ Does not match (wrong password)');
      }
      console.log('');
    } else {
      console.log('\n   (Run with password to verify: node checkChauffeurLogin.js ' + email + ' <password>)\n');
    }

    if (chauffeur.status === 'approved' && chauffeur.isActive && (!password || (password && (await chauffeur.comparePassword(password))))) {
      console.log('   → Login should succeed with these credentials.\n');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

check();
