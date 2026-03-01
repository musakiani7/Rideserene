# Ride Management - Quick Start Guide

## 🚀 Setup & Installation

### 1. Database Setup
The Booking model is already configured in `models/Booking.js` with all necessary fields:
- Customer information
- Trip details (pickup, dropoff, date, time)
- Vehicle and pricing information
- Status tracking (pending, confirmed, assigned, in-progress, completed, cancelled)
- Chauffeur assignment
- Payment tracking

### 2. Backend API Endpoints
All endpoints are configured in `routes/adminDashboard.js` and `controllers/adminBookingController.js`:

✅ **GET** `/api/admin/bookings` - Get all bookings with filters
✅ **GET** `/api/admin/bookings/stats` - Get booking statistics
✅ **GET** `/api/admin/bookings/:id` - Get booking details
✅ **PUT** `/api/admin/bookings/:id` - Update booking details
✅ **PUT** `/api/admin/bookings/:id/status` - Update booking status
✅ **PUT** `/api/admin/bookings/:id/assign` - Assign chauffeur
✅ **PUT** `/api/admin/bookings/bulk-status` - Bulk update status
✅ **DELETE** `/api/admin/bookings/:id` - Cancel booking

---

## 📊 Testing the System

### Step 1: Start the Backend
```bash
cd backend
npm start
```
Server should run on `http://localhost:5000`

### Step 2: Seed Test Data (Optional)
```bash
node seedRideManagement.js
```
This creates 20 sample bookings with realistic data including:
- Different statuses (pending, confirmed, completed, etc.)
- Various ride types (one-way, round-trip, airport transfer)
- Assigned chauffeurs
- Complete pricing information

### Step 3: Test API Endpoints
```bash
node testRideManagement.js
```
This automated test script will:
- ✓ Login as admin
- ✓ Fetch all bookings
- ✓ Get booking statistics
- ✓ Search and filter bookings
- ✓ Update booking status
- ✓ Update booking details

---

## 🎨 Frontend Integration

The Admin Dashboard frontend (`AdminDashboard.jsx`) is already configured to:

### Display Features:
- ✅ Stats cards showing booking counts by status
- ✅ Search bar for finding bookings
- ✅ Status filter dropdown
- ✅ Grid of booking cards with all key information
- ✅ Click to view full details modal
- ✅ Responsive design for all screen sizes

### API Integration:
```javascript
// Fetch bookings from backend
const response = await fetch(
  `http://localhost:5000/api/admin/bookings?status=${statusFilter}&search=${searchTerm}`,
  {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  }
);
```

---

## 🔧 Common Operations

### 1. Get All Bookings with Filters
```javascript
GET /api/admin/bookings?status=pending&search=john&page=1&limit=20
```

### 2. Update Booking Status
```javascript
PUT /api/admin/bookings/:id/status
Body: { "status": "confirmed" }
```

### 3. Assign Chauffeur
```javascript
PUT /api/admin/bookings/:id/assign
Body: { "chauffeurId": "chauffeur_id_here" }
```

### 4. Cancel Booking
```javascript
DELETE /api/admin/bookings/:id
Body: { "cancellationReason": "Customer request" }
```

### 5. Get Statistics
```javascript
GET /api/admin/bookings/stats
```
Returns:
- Total bookings
- Counts by status (pending, confirmed, in-progress, completed, cancelled)
- Today's bookings
- Revenue (completed and pending)

---

## 📁 File Structure

```
backend/
├── models/
│   └── Booking.js                    # Database schema
├── controllers/
│   └── adminBookingController.js     # API logic
├── routes/
│   └── adminDashboard.js             # Route definitions
├── seedRideManagement.js             # Test data seeder
├── testRideManagement.js             # API test script
├── RIDE_MANAGEMENT_API.md            # Complete API documentation
└── RIDE_MANAGEMENT_QUICKSTART.md     # This file

frontend/
└── src/
    └── pages/
        ├── AdminDashboard.jsx        # Main UI component
        └── AdminDashboard-responsive.css  # Styling
```

---

## 🔐 Authentication

All admin endpoints require authentication. Make sure:
1. Admin user exists in database (run `node seedAdminUser.js` if needed)
2. Login credentials: `admin@rideserene.com` / `Admin@123`
3. Include JWT token in Authorization header: `Bearer <token>`

---

## 📈 Database Indexes

The Booking model has optimized indexes for:
- Customer queries: `{ customer: 1, createdAt: -1 }`
- Status filtering: `{ status: 1 }`
- Payment tracking: `{ paymentStatus: 1 }`
- Unique booking references: `{ bookingReference: 1 }`

---

## 🐛 Troubleshooting

### Issue: "No bookings found"
**Solution:** Run `node seedRideManagement.js` to create test data

### Issue: "Not authorized"
**Solution:** 
1. Check if admin user exists: `node seedAdminUser.js`
2. Login to get fresh token
3. Include token in Authorization header

### Issue: "MongoDB connection error"
**Solution:** 
1. Ensure MongoDB is running
2. Check MONGODB_URI in `.env` file
3. Verify network connectivity

### Issue: Frontend not displaying data
**Solution:**
1. Check backend is running on port 5000
2. Verify CORS is configured in server.js
3. Check browser console for API errors
4. Ensure admin token is stored in localStorage

---

## 🎯 Next Steps

1. **Test the API:**
   ```bash
   node testRideManagement.js
   ```

2. **Seed sample data:**
   ```bash
   node seedRideManagement.js
   ```

3. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access Admin Dashboard:**
   - Navigate to admin dashboard in browser
   - Login with admin credentials
   - View Ride Management section

5. **Verify Integration:**
   - Check stats cards display correct counts
   - Test search functionality
   - Filter by status
   - Click booking cards to view details
   - Update booking status in modal

---

## 📚 Additional Resources

- **Complete API Documentation:** `RIDE_MANAGEMENT_API.md`
- **Database Schema:** `models/Booking.js`
- **Controller Logic:** `controllers/adminBookingController.js`
- **Frontend Component:** `frontend/src/pages/AdminDashboard.jsx`

---

## ✅ Checklist

- [ ] MongoDB connected
- [ ] Backend server running
- [ ] Admin user created
- [ ] Test data seeded
- [ ] API endpoints tested
- [ ] Frontend displaying bookings
- [ ] Search functionality working
- [ ] Filter by status working
- [ ] Booking details modal working
- [ ] Status updates working

---

**Ready to go!** 🚗✨

For detailed API documentation, see `RIDE_MANAGEMENT_API.md`
