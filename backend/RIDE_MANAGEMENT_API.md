# Ride Management API Documentation

## Base URL
```
http://localhost:5000/api/admin
```

## Authentication
All endpoints require admin authentication. Include the admin JWT token in the Authorization header:
```
Authorization: Bearer <admin_token>
```

---

## Endpoints

### 1. Get All Bookings
**GET** `/bookings`

Retrieve all bookings with optional filtering, search, and pagination.

**Query Parameters:**
- `status` (optional): Filter by status (pending, confirmed, assigned, in-progress, completed, cancelled)
- `search` (optional): Search by booking reference, customer name, phone, or email
- `startDate` (optional): Filter bookings from this date (ISO format)
- `endDate` (optional): Filter bookings until this date (ISO format)
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 20): Number of results per page

**Example Request:**
```javascript
GET /api/admin/bookings?status=pending&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "booking_id",
      "bookingReference": "BK-ABC123",
      "customer": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "chauffeur": {
        "firstName": "James",
        "lastName": "Smith",
        "phone": "+1987654321"
      },
      "rideType": "one-way",
      "pickupLocation": {
        "address": "123 Main St, New York, NY",
        "coordinates": { "lat": 40.7128, "lng": -74.0060 }
      },
      "dropoffLocation": {
        "address": "456 Park Ave, Manhattan, NY",
        "coordinates": { "lat": 40.7614, "lng": -73.9776 }
      },
      "pickupDate": "2025-12-10T00:00:00.000Z",
      "pickupTime": "09:00",
      "vehicleClass": {
        "name": "Executive Sedan",
        "vehicle": "Mercedes S-Class",
        "passengers": 3,
        "luggage": 2
      },
      "totalPrice": 150.50,
      "status": "pending",
      "paymentStatus": "pending",
      "createdAt": "2025-12-08T10:30:00.000Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 48
}
```

---

### 2. Get Booking by ID
**GET** `/bookings/:id`

Retrieve detailed information about a specific booking.

**Example Request:**
```javascript
GET /api/admin/bookings/6754abc123def456
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6754abc123def456",
    "bookingReference": "BK-ABC123",
    "customer": {
      "_id": "customer_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "chauffeur": {
      "_id": "chauffeur_id",
      "firstName": "James",
      "lastName": "Smith",
      "phone": "+1987654321",
      "email": "james@example.com"
    },
    "rideType": "one-way",
    "pickupLocation": {
      "address": "123 Main St, New York, NY",
      "coordinates": { "lat": 40.7128, "lng": -74.0060 }
    },
    "dropoffLocation": {
      "address": "456 Park Ave, Manhattan, NY",
      "coordinates": { "lat": 40.7614, "lng": -73.9776 }
    },
    "pickupDate": "2025-12-10T00:00:00.000Z",
    "pickupTime": "09:00",
    "vehicleClass": {
      "name": "Executive Sedan",
      "vehicle": "Mercedes S-Class",
      "passengers": 3,
      "luggage": 2,
      "basePrice": 120
    },
    "passengerInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "specialRequests": "Child seat required"
    },
    "basePrice": 120,
    "taxes": 12,
    "fees": 15,
    "discount": 0,
    "totalPrice": 147,
    "paymentStatus": "pending",
    "status": "pending",
    "createdAt": "2025-12-08T10:30:00.000Z",
    "updatedAt": "2025-12-08T10:30:00.000Z"
  }
}
```

---

### 3. Update Booking Status
**PUT** `/bookings/:id/status`

Update the status of a booking.

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Status Values:**
- `pending`
- `confirmed`
- `assigned`
- `in-progress`
- `completed`
- `cancelled`

**Response:**
```json
{
  "success": true,
  "message": "Booking status updated successfully",
  "data": {
    "_id": "booking_id",
    "status": "confirmed",
    "updatedAt": "2025-12-08T11:00:00.000Z"
  }
}
```

---

### 4. Assign Chauffeur to Booking
**PUT** `/bookings/:id/assign`

Assign a chauffeur to a booking. Automatically updates status to 'confirmed'.

**Request Body:**
```json
{
  "chauffeurId": "6754chauffeur123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chauffeur assigned successfully",
  "data": {
    "_id": "booking_id",
    "chauffeur": "6754chauffeur123",
    "status": "confirmed",
    "assignedAt": "2025-12-08T11:15:00.000Z"
  }
}
```

---

### 5. Update Booking Details
**PUT** `/bookings/:id`

Update specific booking details.

**Request Body:**
```json
{
  "pickupDate": "2025-12-11T00:00:00.000Z",
  "pickupTime": "10:00",
  "notes": "Customer requested earlier pickup",
  "specialRequests": "Need larger vehicle"
}
```

**Allowed Update Fields:**
- `pickupDate`
- `pickupTime`
- `pickupLocation`
- `dropoffLocation`
- `notes`
- `specialRequests`
- `passengerInfo`

**Response:**
```json
{
  "success": true,
  "message": "Booking updated successfully",
  "data": {
    "_id": "booking_id",
    "pickupDate": "2025-12-11T00:00:00.000Z",
    "pickupTime": "10:00",
    "notes": "Customer requested earlier pickup",
    "updatedAt": "2025-12-08T11:30:00.000Z"
  }
}
```

---

### 6. Cancel Booking
**DELETE** `/bookings/:id`

Cancel a booking with optional cancellation reason.

**Request Body:**
```json
{
  "cancellationReason": "Customer requested cancellation due to schedule change"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "_id": "booking_id",
    "status": "cancelled",
    "cancellationReason": "Customer requested cancellation due to schedule change",
    "cancelledAt": "2025-12-08T11:45:00.000Z"
  }
}
```

---

### 7. Get Booking Statistics
**GET** `/bookings/stats`

Get comprehensive statistics about all bookings.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBookings": 150,
    "pendingBookings": 25,
    "confirmedBookings": 40,
    "inProgressBookings": 8,
    "completedBookings": 65,
    "cancelledBookings": 12,
    "todaysBookings": 15,
    "completedRevenue": 12500.50,
    "pendingRevenue": 5200.00
  }
}
```

---

### 8. Bulk Update Status
**PUT** `/bookings/bulk-status`

Update the status of multiple bookings at once.

**Request Body:**
```json
{
  "bookingIds": ["booking_id_1", "booking_id_2", "booking_id_3"],
  "status": "confirmed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 bookings updated successfully",
  "data": {
    "acknowledged": true,
    "modifiedCount": 3,
    "matchedCount": 3
  }
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Booking not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server error",
  "error": "Detailed error message"
}
```

---

## Database Schema

### Booking Model Fields

```javascript
{
  customer: ObjectId (ref: Customer),
  bookingReference: String (unique, auto-generated),
  rideType: String (enum),
  pickupLocation: {
    address: String,
    placeId: String,
    coordinates: { lat: Number, lng: Number }
  },
  dropoffLocation: {
    address: String,
    placeId: String,
    coordinates: { lat: Number, lng: Number }
  },
  pickupDate: Date,
  pickupTime: String,
  duration: Number,
  estimatedDistance: Number,
  vehicleClass: {
    name: String,
    vehicle: String,
    passengers: Number,
    luggage: Number,
    basePrice: Number
  },
  passengerInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    flightNumber: String,
    specialRequests: String
  },
  basePrice: Number,
  taxes: Number,
  fees: Number,
  discount: Number,
  totalPrice: Number,
  paymentStatus: String (enum),
  paymentMethod: String (enum),
  status: String (enum),
  chauffeur: ObjectId (ref: Chauffeur),
  assignedAt: Date,
  startedAt: Date,
  completedAt: Date,
  notes: String,
  cancellationReason: String,
  cancelledAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing the API

### Using the Seed Script

1. Ensure MongoDB is running and connected
2. Run the seed script to populate test data:
```bash
node seedRideManagement.js
```

This will create 20 sample bookings with various statuses, assigned chauffeurs, and realistic data.

### Example cURL Commands

**Get all bookings:**
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/api/admin/bookings
```

**Update booking status:**
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}' \
  http://localhost:5000/api/admin/bookings/BOOKING_ID/status
```

**Get booking statistics:**
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/api/admin/bookings/stats
```

---

## Frontend Integration

The Admin Dashboard frontend is already configured to use these endpoints. The key integration points are:

1. **Fetching bookings:** `GET /api/admin/bookings` with search and filter params
2. **Viewing details:** Modal triggered by clicking booking cards
3. **Status updates:** Dropdown in booking details modal
4. **Chauffeur assignment:** Select dropdown in modal
5. **Statistics:** Displayed in stats cards at the top of the page

All API calls are made using `fetch()` with the admin token from localStorage.
