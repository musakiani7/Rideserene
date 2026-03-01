# Customer Management API Documentation

## Overview

The Customer Management system provides comprehensive backend APIs for managing customers in the Ride Serene admin panel. This includes viewing customer profiles, tracking booking history, managing customer data, and monitoring customer statistics.

## Database Schema

### Customer Model (`models/Customer.js`)

```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique, lowercase),
  phone: String (required),
  password: String (required, hashed, min 6 chars),
  isVerified: Boolean (default: false),
  createdAt: Date (default: Date.now),
  lastLogin: Date,
  wallet: {
    balance: Number (default: 0),
    currency: String (default: 'USD')
  },
  preferences: {
    defaultVehicleClass: String,
    notifications: {
      email: Boolean (default: true),
      sms: Boolean (default: true),
      push: Boolean (default: true)
    },
    language: String (default: 'en')
  },
  profileImage: String
}
```

**Security Features:**
- Password hashing with bcrypt (10 salt rounds)
- Password excluded from queries by default (`select: false`)
- Password comparison method: `customer.comparePassword(password)`

## API Endpoints

All endpoints require admin authentication via JWT token in Authorization header:
```
Authorization: Bearer <admin_jwt_token>
```

### 1. Get All Customers

**Endpoint:** `GET /api/admin/customers`

**Query Parameters:**
- `search` (optional): Search by first name, last name, email, or phone
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 20): Number of customers per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "67534eb75e2f0e641c278392",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@example.com",
      "phone": "+1 (555) 123-4567",
      "isVerified": true,
      "createdAt": "2024-12-06T21:23:03.098Z",
      "lastLogin": "2024-12-08T08:30:16.257Z",
      "wallet": {
        "balance": 250.00,
        "currency": "USD"
      },
      "preferences": {
        "defaultVehicleClass": "Luxury Sedan",
        "notifications": {
          "email": true,
          "sms": true,
          "push": true
        },
        "language": "en"
      },
      "bookingCount": 15,
      "totalSpent": 2814.00
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 8
}
```

**Features:**
- Search across first name, last name, email, and phone (case-insensitive)
- Pagination support
- Automatically calculates `bookingCount` and `totalSpent` for each customer
- Sorted by creation date (newest first)

### 2. Get Customer by ID

**Endpoint:** `GET /api/admin/customers/:id`

**URL Parameters:**
- `id`: Customer MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "_id": "67534eb75e2f0e641c278392",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@example.com",
      "phone": "+1 (555) 123-4567",
      "isVerified": true,
      "createdAt": "2024-12-06T21:23:03.098Z",
      "lastLogin": "2024-12-08T08:30:16.257Z",
      "wallet": {
        "balance": 250.00,
        "currency": "USD"
      },
      "preferences": {
        "defaultVehicleClass": "Luxury Sedan",
        "notifications": {
          "email": true,
          "sms": true,
          "push": true
        },
        "language": "en"
      }
    },
    "bookings": [
      {
        "_id": "67534f3a5e2f0e641c278397",
        "customerName": "John Smith",
        "pickupLocation": "JFK Airport",
        "dropoffLocation": "Manhattan Hotel",
        "pickupDateTime": "2024-12-10T10:00:00.000Z",
        "vehicleClass": "Luxury Sedan",
        "status": "completed",
        "totalPrice": 150.00
      }
    ],
    "stats": {
      "bookingCount": 15,
      "totalSpent": 2814.00
    }
  }
}
```

**Features:**
- Returns complete customer profile
- Includes last 10 bookings (sorted newest first)
- Provides booking statistics
- Calculates total spent from completed bookings only

### 3. Update Customer

**Endpoint:** `PUT /api/admin/customers/:id`

**URL Parameters:**
- `id`: Customer MongoDB ObjectId

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@newemail.com",
  "phone": "+1 (555) 999-9999",
  "isVerified": true,
  "wallet": {
    "balance": 500.00
  },
  "preferences": {
    "defaultVehicleClass": "SUV",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    // Updated customer object
  }
}
```

**Features:**
- Partial updates supported (only send fields to update)
- Validation runs on updates
- Password cannot be updated via this endpoint
- Returns updated customer data

### 4. Delete Customer

**Endpoint:** `DELETE /api/admin/customers/:id`

**URL Parameters:**
- `id`: Customer MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

**⚠️ Warning:** 
- Deleting a customer does NOT delete their bookings
- Consider implementing soft delete or archiving instead
- Bookings will remain in database but customer reference will be null

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Customer not found"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "Server error",
  "error": "Error details (development only)"
}
```

## Authentication

### Admin Login

**Endpoint:** `POST /api/admin/auth/login`

**Request Body:**
```json
{
  "email": "admin@rideserene.com",
  "password": "admin123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "_id": "67534e835e2f0e641c27838f",
    "firstName": "Super",
    "lastName": "Admin",
    "email": "admin@rideserene.com",
    "role": "super_admin"
  }
}
```

Use the returned `token` in all subsequent requests:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Database Seeding

### Seed Sample Customers

Run the following command to populate the database with sample customers:

```bash
cd backend
node seedCustomers.js
```

This creates 8 sample customers with:
- Realistic names and contact information
- Varied verification statuses
- Different wallet balances
- Custom preferences
- Recent login dates

### Seed Admin User

```bash
node seedAdminUser.js
```

Creates super admin with:
- Email: `admin@rideserene.com`
- Password: `admin123456`
- Full permissions

## Testing

### Test Customer API

Run the comprehensive test script:

```bash
node testCustomerAPI.js
```

This will:
1. Login as admin
2. Fetch all customers
3. Retrieve detailed customer information
4. Verify all API endpoints are working

## Integration with Frontend

The frontend `AdminDashboard.jsx` Customer Management section uses these endpoints:

```javascript
// Fetch all customers
const response = await fetch('http://localhost:5000/api/admin/customers', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

// Get customer details
const response = await fetch(`http://localhost:5000/api/admin/customers/${customerId}`, {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
```

## File Structure

```
backend/
├── controllers/
│   └── adminCustomerController.js    # Customer API logic
├── models/
│   ├── Customer.js                   # Customer schema
│   └── Booking.js                    # Referenced for stats
├── routes/
│   └── adminDashboard.js             # Routes definition
├── middleware/
│   └── adminAuth.js                  # JWT authentication
├── seedCustomers.js                  # Database seeding
├── testCustomerAPI.js                # API testing
└── server.js                         # Express server setup
```

## Security Considerations

✅ **Implemented:**
- JWT token authentication for all endpoints
- Password hashing with bcrypt
- Email uniqueness validation
- Input sanitization via Mongoose schema
- Admin role verification

⚠️ **Recommended:**
- Implement rate limiting on API endpoints
- Add CORS configuration for production
- Implement customer email verification system
- Add activity logging for customer changes
- Consider implementing soft delete instead of hard delete
- Add data export functionality for GDPR compliance

## Performance Optimization

**Current Implementation:**
- Pagination support (20 customers per page default)
- Indexed fields: email (unique index)
- Limited bookings query (last 10 only)
- Aggregation pipeline for total spent calculation

**Potential Improvements:**
- Add indexes on frequently searched fields (firstName, lastName, phone)
- Implement Redis caching for frequently accessed customers
- Use projection to limit returned fields
- Implement lazy loading for customer bookings

## Monitoring

Track these metrics for customer management:
- Total active customers
- New customer registrations per day/week/month
- Customer retention rate
- Average customer lifetime value
- Booking frequency per customer
- Wallet usage statistics

## Support

For issues or questions:
- Check server logs: `backend/logs/`
- Verify MongoDB connection: `mongodb://localhost:27017/sherkhan`
- Test API endpoints: `node testCustomerAPI.js`
- Review error responses for specific error codes

## Changelog

**Version 1.0 (December 2024)**
- Initial implementation of Customer Management API
- CRUD operations for customers
- Customer statistics and booking history
- Search and pagination support
- Admin authentication integration
- Database seeding scripts
