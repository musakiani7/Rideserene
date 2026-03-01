# Ride Request Management - Backend Documentation

## Overview

This documentation covers the backend implementation for the customer ride request management system, allowing customers to create, view, edit, and cancel ride requests from their dashboard.

## API Endpoints

### 1. Create Ride Request

**Endpoint:** `POST /api/bookings`

**Authentication:** Required (Bearer Token)

**Description:** Creates a new ride request for the authenticated customer.

**Request Body:**
```json
{
  "rideType": "hourly",
  "pickupLocation": {
    "address": "123 Main Street, New York, NY",
    "lat": 40.7128,
    "lng": -74.0060
  },
  "dropoffLocation": {
    "address": "456 Park Avenue, New York, NY",
    "lat": 40.7589,
    "lng": -73.9851
  },
  "pickupDate": "2025-12-15T00:00:00.000Z",
  "pickupTime": "14:00",
  "duration": 4,
  "estimatedDistance": 0,
  "estimatedArrivalTime": "14:00",
  "vehicleClass": {
    "name": "Business Sedan",
    "vehicle": "Mercedes S-Class",
    "basePrice": 100
  },
  "passengerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0123"
  },
  "basePrice": 400,
  "taxes": 0,
  "fees": 0,
  "discount": 0,
  "totalPrice": 400,
  "currency": "USD"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "id": "674a9f1234567890abcdef12",
    "bookingReference": "BK-L8K9M2N3-A1B2",
    "totalPrice": 400,
    "currency": "USD",
    "status": "pending",
    "paymentStatus": "pending"
  }
}
```

---

### 2. Update Ride Request

**Endpoint:** `PUT /api/bookings/:id`

**Authentication:** Required (Bearer Token)

**Description:** Updates an existing ride request. Only pending or confirmed bookings can be updated. Customers can only update their own bookings.

**URL Parameters:**
- `id` - The booking ID

**Request Body:** (all fields optional)
```json
{
  "pickupLocation": {
    "address": "789 Updated Street, New York, NY",
    "lat": 40.7489,
    "lng": -73.9680
  },
  "dropoffLocation": {
    "address": "321 New Avenue, New York, NY",
    "lat": 40.7614,
    "lng": -73.9776
  },
  "pickupDate": "2025-12-20T00:00:00.000Z",
  "pickupTime": "16:30",
  "duration": 6,
  "passengerInfo": {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1-555-9999"
  },
  "vehicleClass": {
    "name": "Luxury SUV",
    "vehicle": "Cadillac Escalade",
    "basePrice": 150
  },
  "basePrice": 900,
  "totalPrice": 900
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking updated successfully",
  "booking": {
    "_id": "674a9f1234567890abcdef12",
    "bookingReference": "BK-L8K9M2N3-A1B2",
    "customer": "674a9f1234567890abcdef00",
    "rideType": "hourly",
    "pickupLocation": {
      "address": "789 Updated Street, New York, NY",
      "lat": 40.7489,
      "lng": -73.9680
    },
    "status": "pending",
    "updatedAt": "2025-12-08T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Booking status doesn't allow updates
- `403 Forbidden` - Not authorized to update this booking
- `404 Not Found` - Booking not found

---

### 3. Cancel Ride Request

**Endpoint:** `PUT /api/bookings/:id/cancel`

**Authentication:** Required (Bearer Token)

**Description:** Cancels an existing ride request. Cannot cancel completed or already cancelled bookings.

**URL Parameters:**
- `id` - The booking ID

**Request Body:**
```json
{
  "cancellationReason": "Customer requested cancellation"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "booking": {
    "id": "674a9f1234567890abcdef12",
    "bookingReference": "BK-L8K9M2N3-A1B2",
    "status": "cancelled"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Cannot cancel booking with current status
- `403 Forbidden` - Not authorized to cancel this booking
- `404 Not Found` - Booking not found

---

### 4. Get Single Ride

**Endpoint:** `GET /api/bookings/:id`

**Authentication:** Required (Bearer Token)

**Description:** Retrieves details of a specific booking.

**Response (200 OK):**
```json
{
  "success": true,
  "booking": {
    "_id": "674a9f1234567890abcdef12",
    "bookingReference": "BK-L8K9M2N3-A1B2",
    "customer": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "rideType": "hourly",
    "pickupLocation": {
      "address": "123 Main Street, New York, NY"
    },
    "pickupDate": "2025-12-15T00:00:00.000Z",
    "pickupTime": "14:00",
    "vehicleClass": {
      "name": "Business Sedan",
      "vehicle": "Mercedes S-Class"
    },
    "passengerInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-0123"
    },
    "totalPrice": 400,
    "status": "pending",
    "paymentStatus": "pending"
  }
}
```

---

### 5. Get Upcoming Rides

**Endpoint:** `GET /api/dashboard/upcoming-rides`

**Authentication:** Required (Bearer Token)

**Description:** Retrieves all upcoming rides for the authenticated customer.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "674a9f1234567890abcdef12",
      "bookingReference": "BK-L8K9M2N3-A1B2",
      "rideType": "hourly",
      "pickupLocation": {
        "address": "123 Main Street, New York, NY"
      },
      "dropoffLocation": {
        "address": ""
      },
      "pickupDate": "2025-12-15T00:00:00.000Z",
      "pickupTime": "14:00",
      "duration": 4,
      "vehicleClass": {
        "name": "Business Sedan",
        "vehicle": "Mercedes S-Class"
      },
      "passengerInfo": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1-555-0123"
      },
      "totalPrice": 400,
      "status": "pending",
      "chauffeur": null
    }
  ]
}
```

---

## Database Schema

### Booking Model Updates

The `Booking` model has been updated to support the new ride types:

**Enhanced Fields:**

```javascript
// Ride Types
rideType: {
  type: String,
  enum: [
    'one-way',        // Legacy support
    'by-hour',        // Legacy support
    'round-trip',     // Legacy support
    'hourly',         // New: Hourly booking
    'city-to-city',   // New: City to city transfer
    'airport-transfer' // New: Airport transfer
  ],
  required: true
}

// Vehicle Class (now more flexible)
vehicleClass: {
  id: String,              // Optional
  name: String,            // Required
  vehicle: String,         // Vehicle model
  passengers: Number,      // Passenger capacity
  luggage: Number,         // Luggage capacity
  basePrice: Number        // Base hourly/trip price
}
```

**Timestamps:**
- `createdAt` - Auto-generated on creation
- `updatedAt` - Auto-updated on save
- `cancelledAt` - Set when booking is cancelled

---

## Authorization & Security

### Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Authorization Rules

1. **Create Ride:**
   - Must be authenticated customer
   - Creates booking for the authenticated user

2. **Update Ride:**
   - Must own the booking
   - Booking status must be `pending` or `confirmed`
   - Cannot update `assigned`, `in-progress`, `completed`, or `cancelled` bookings

3. **Cancel Ride:**
   - Must own the booking
   - Cannot cancel `completed` or `cancelled` bookings

4. **View Ride:**
   - Must own the booking OR be an admin

---

## Business Logic

### Updateable Fields

The following fields can be updated via the update endpoint:
- `pickupLocation`
- `dropoffLocation`
- `pickupDate`
- `pickupTime`
- `duration`
- `passengerInfo`
- `vehicleClass`
- `estimatedDistance`
- `estimatedArrivalTime`
- `basePrice`
- `taxes`
- `fees`
- `discount`
- `totalPrice`

### Non-Updateable Fields

The following fields cannot be updated after creation:
- `customer` (booking owner)
- `bookingReference`
- `status` (except via cancel endpoint)
- `paymentStatus`
- `chauffeur` (managed by admin)
- `createdAt`

### Status Workflow

```
pending → confirmed → assigned → in-progress → completed
   ↓
cancelled (from pending or confirmed only)
```

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Cannot update booking with status: in-progress"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Not authorized to update this booking"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Booking not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Error updating booking",
  "error": "Detailed error message (development only)"
}
```

---

## Testing

### Running Tests

A comprehensive test suite is provided in `test-ride-requests.js`:

```bash
# Make sure backend is running
cd backend
node server.js

# In another terminal, run tests
node test-ride-requests.js
```

### Test Coverage

The test suite covers:
1. ✅ User authentication
2. ✅ Create ride request
3. ✅ Get ride details
4. ✅ Update ride request
5. ✅ Get upcoming rides list
6. ✅ Cancel ride request

### Prerequisites for Testing

1. Backend server must be running
2. MongoDB must be connected
3. Test user must exist with credentials:
   - Email: `customer@test.com`
   - Password: `password123`

---

## Integration Notes

### Frontend Integration

The frontend `UpcomingRidesTab` component uses these endpoints:

1. **Create:** `POST /api/bookings` - Via form submission
2. **Update:** `PUT /api/bookings/:id` - Via edit modal
3. **Cancel:** `PUT /api/bookings/:id/cancel` - Via cancel button
4. **List:** `GET /api/dashboard/upcoming-rides` - On component mount

### Request Headers

All requests include:
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

---

## Performance Considerations

### Database Indexes

The Booking model has indexes on:
- `customer` + `createdAt` (compound) - Fast customer booking queries
- `bookingReference` - Unique lookup
- `status` - Status filtering
- `paymentStatus` - Payment filtering

### Query Optimization

- Populate chauffeur details only when needed
- Use lean queries for list views
- Limit fields returned in list endpoints

---

## Future Enhancements

Potential improvements:
1. Add booking modification history tracking
2. Implement cancellation fees based on timing
3. Add real-time notifications for booking updates
4. Support partial refunds
5. Add booking templates for frequent routes
6. Implement recurring bookings

---

## Support & Troubleshooting

### Common Issues

**"Cannot update booking with status: X"**
- Solution: Only pending and confirmed bookings can be updated

**"Not authorized to update this booking"**
- Solution: Ensure the authenticated user owns the booking

**"Validation failed"**
- Solution: Check all required fields are provided with correct data types

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages in API responses.

---

## Changelog

### Version 1.0.0 (December 2025)
- ✅ Added `updateBooking` controller function
- ✅ Added `PUT /api/bookings/:id` route
- ✅ Updated Booking model with new ride types
- ✅ Added flexible vehicle class schema
- ✅ Updated validation rules
- ✅ Created comprehensive test suite
- ✅ Added documentation

---

## API Response Standards

All API responses follow this structure:

**Success:**
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev only)"
}
```

---

For questions or issues, please contact the development team.
