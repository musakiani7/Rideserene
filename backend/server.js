const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
// Increase body parser limit to handle base64-encoded files (up to 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/stripe', require('./routes/stripe'));
app.use('/api/chauffeur', require('./routes/chauffeur'));
app.use('/api/chauffeur/dashboard', require('./routes/chauffeurDashboard'));
app.use('/api/chauffeur/reviews', require('./routes/reviews'));
app.use('/api/corporate', require('./routes/corporate'));
app.use('/api/travel-agency', require('./routes/travelAgency'));
app.use('/api/partnership', require('./routes/partnership'));
app.use('/api/events', require('./routes/events'));

// Admin routes
app.use('/api/admin/auth', require('./routes/adminAuth'));
app.use('/api/admin/payouts', require('./routes/adminPayouts'));
app.use('/api/admin', require('./routes/adminDashboard'));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Sher Khan Limousine API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
