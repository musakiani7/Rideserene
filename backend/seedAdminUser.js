const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@rideserene.com' });

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit();
    }

    // Create super admin
    const admin = await Admin.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@rideserene.com',
      password: 'admin123456', // Change this password after first login
      role: 'super_admin',
      permissions: {
        manageBookings: true,
        manageChauffeurs: true,
        manageCustomers: true,
        managePricing: true,
        manageFinance: true,
        manageSupport: true,
      },
      isActive: true,
    });

    console.log('✅ Super Admin created successfully');
    console.log('Email: admin@rideserene.com');
    console.log('Password: admin123456');
    console.log('⚠️  Please change the password after first login!');

    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
