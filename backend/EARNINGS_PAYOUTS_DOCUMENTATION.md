# Earnings & Payouts System - Complete Documentation

## Overview

The Earnings & Payouts system provides comprehensive tracking of chauffeur earnings and automated payout request/approval workflow. The system tracks all completed rides, calculates earnings with commission deductions, and manages payout requests from submission to completion.

## Database Schema

### Payout Model

```javascript
{
  chauffeur: ObjectId,              // Reference to Chauffeur
  amount: Number,                   // Final payout amount (net)
  currency: String,                 // Default: 'USD'
  
  // Period
  periodStart: Date,                // Start date of earning period
  periodEnd: Date,                  // End date of earning period
  
  // Status
  status: String,                   // pending, processing, completed, failed, cancelled
  
  // Payment Method
  paymentMethod: String,            // bank_transfer, paypal, stripe, cash, check
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    routingNumber: String,
    swiftCode: String
  },
  
  // Transaction
  transactionId: String,            // Bank/payment transaction ID
  transactionReference: String,     // Internal reference
  
  // Rides
  rides: [ObjectId],                // References to Booking
  rideCount: Number,                // Count of rides in payout
  
  // Calculations
  commission: Number,               // Platform commission amount
  commissionPercentage: Number,     // Commission rate (default: 15%)
  deductions: Number,               // Additional deductions
  bonuses: Number,                  // Bonus amounts
  adjustments: Number,              // Manual adjustments
  grossAmount: Number,              // Total ride earnings
  netAmount: Number,                // Final amount after deductions
  
  // Timing
  requestedAt: Date,                // When payout was requested
  processedAt: Date,                // When admin processed it
  completedAt: Date,                // When payment completed
  failedAt: Date,                   // When payment failed
  
  // Notes
  notes: String,                    // Admin notes
  failureReason: String,            // Reason for failure/rejection
  
  // Admin
  processedBy: ObjectId             // Reference to Admin who processed
}
```

## API Endpoints

### Chauffeur Endpoints

#### 1. Request Payout
```
POST /api/chauffeur/dashboard/payouts/request
```

**Request Body:**
```json
{
  "periodStart": "2024-01-01",
  "periodEnd": "2024-01-31",
  "paymentMethod": "bank_transfer",
  "bankDetails": {
    "accountHolderName": "John Doe",
    "accountNumber": "1234567890",
    "bankName": "Bank of America",
    "routingNumber": "123456789",
    "swiftCode": "BOFAUS3N"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payout request submitted successfully",
  "data": {
    "_id": "...",
    "chauffeur": { ... },
    "amount": 2295,
    "grossAmount": 2700,
    "netAmount": 2295,
    "commission": 405,
    "commissionPercentage": 15,
    "rideCount": 15,
    "status": "pending",
    "periodStart": "2024-01-01",
    "periodEnd": "2024-01-31",
    "paymentMethod": "bank_transfer",
    "bankDetails": { ... },
    "rides": ["...", "..."],
    "requestedAt": "2024-02-01T10:30:00Z"
  }
}
```

**Features:**
- Automatically calculates gross and net amounts
- Applies 15% platform commission
- Validates that rides haven't been paid already
- Prevents duplicate payout requests for same rides

---

#### 2. Get Payout History
```
GET /api/chauffeur/dashboard/payouts?status=pending&limit=50&page=1
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, processing, completed, failed, cancelled)
- `limit` (optional): Number of records per page (default: 50)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "_id": "...",
        "amount": 2295,
        "status": "pending",
        "rideCount": 15,
        "periodStart": "2024-01-01",
        "periodEnd": "2024-01-31",
        "createdAt": "2024-02-01T10:30:00Z",
        "rides": [...]
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 50,
      "pages": 1
    },
    "summary": [
      { "_id": "pending", "count": 5, "totalAmount": 5000 },
      { "_id": "completed", "count": 20, "totalAmount": 45000 }
    ]
  }
}
```

---

#### 3. Get Available Balance
```
GET /api/chauffeur/dashboard/payouts/available-balance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "availableBalance": 2295,
    "grossAmount": 2700,
    "commission": 405,
    "commissionPercentage": 15,
    "unpaidRides": 15,
    "pendingPayouts": 2,
    "pendingAmount": 1500,
    "rides": [
      {
        "id": "...",
        "bookingReference": "BK-2024-001",
        "date": "2024-01-15",
        "amount": 180,
        "status": "completed"
      }
    ]
  }
}
```

**Use Case:**
- Show chauffeur how much they can request for payout
- Display unpaid rides
- Show pending payout requests

---

#### 4. Get Payout Details
```
GET /api/chauffeur/dashboard/payouts/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "chauffeur": { ... },
    "amount": 2295,
    "grossAmount": 2700,
    "netAmount": 2295,
    "commission": 405,
    "status": "completed",
    "paymentMethod": "bank_transfer",
    "transactionId": "TXN123456",
    "rides": [
      {
        "bookingReference": "BK-2024-001",
        "totalPrice": 180,
        "pickupDate": "2024-01-15",
        "customer": { ... }
      }
    ],
    "processedBy": { ... },
    "completedAt": "2024-02-02T15:45:00Z"
  }
}
```

---

#### 5. Cancel Payout Request
```
PUT /api/chauffeur/dashboard/payouts/:id/cancel
```

**Response:**
```json
{
  "success": true,
  "message": "Payout request cancelled successfully",
  "data": { ... }
}
```

**Restrictions:**
- Can only cancel payouts with status "pending"
- Once processing starts, cannot be cancelled by chauffeur

---

### Admin Endpoints

#### 1. Get All Payouts
```
GET /api/admin/payouts?status=pending&limit=50&page=1
```

**Query Parameters:**
- `status` (optional): Filter by status
- `chauffeur` (optional): Filter by chauffeur ID
- `startDate` (optional): Filter by creation date range
- `endDate` (optional): Filter by creation date range
- `limit` (optional): Records per page
- `page` (optional): Page number

**Response:** Similar to chauffeur endpoint but includes all chauffeurs

---

#### 2. Get Payout Statistics
```
GET /api/admin/payouts/stats?period=month
```

**Query Parameters:**
- `period` (optional): today, week, month, year, all (default: all)

**Response:**
```json
{
  "success": true,
  "data": {
    "statusStats": [
      { "_id": "pending", "count": 15, "totalAmount": 25000 },
      { "_id": "processing", "count": 5, "totalAmount": 8000 },
      { "_id": "completed", "count": 150, "totalAmount": 280000 }
    ],
    "paymentMethodStats": [
      { "_id": "bank_transfer", "count": 120, "totalAmount": 220000 },
      { "_id": "paypal", "count": 30, "totalAmount": 60000 }
    ],
    "monthlyTrend": [
      { "_id": { "year": 2024, "month": 1 }, "count": 45, "totalAmount": 85000, "avgAmount": 1888 }
    ],
    "topChauffeurs": [
      {
        "_id": "...",
        "totalPayouts": 12,
        "totalAmount": 28000,
        "chauffeur": { ... }
      }
    ]
  }
}
```

---

#### 3. Approve Payout
```
PUT /api/admin/payouts/:id/approve
```

**Request Body:**
```json
{
  "notes": "Approved for processing"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payout approved and processing",
  "data": { ... }
}
```

**Status Change:** pending → processing

---

#### 4. Complete Payout
```
PUT /api/admin/payouts/:id/complete
```

**Request Body:**
```json
{
  "transactionId": "TXN123456789",
  "transactionReference": "REF-2024-001",
  "notes": "Payment completed via bank transfer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payout completed successfully",
  "data": { ... }
}
```

**Status Change:** processing → completed

---

#### 5. Reject Payout
```
PUT /api/admin/payouts/:id/reject
```

**Request Body:**
```json
{
  "failureReason": "Invalid bank details provided"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payout rejected",
  "data": { ... }
}
```

**Status Change:** pending/processing → failed

---

## Workflow

### Chauffeur Workflow

1. **View Available Balance**
   - Navigate to Earnings & Payouts
   - See total unpaid earnings
   - View list of completed unpaid rides

2. **Request Payout**
   - Select period (date range)
   - Choose payment method
   - Enter bank/payment details
   - Submit request
   - Receives "pending" status

3. **Track Status**
   - View payout history
   - Check status: pending → processing → completed
   - Download payout receipt (when completed)

4. **Cancel Request** (if needed)
   - Can cancel while status is "pending"
   - Rides become available for new payout request

### Admin Workflow

1. **Review Requests**
   - View all pending payout requests
   - See chauffeur details, ride count, amounts
   - Verify bank/payment details

2. **Approve**
   - Approve valid requests
   - Status changes to "processing"
   - Add notes if needed

3. **Process Payment**
   - Make bank transfer/payment
   - Enter transaction ID
   - Mark as completed

4. **Reject** (if invalid)
   - Reject with reason
   - Status changes to "failed"
   - Chauffeur can submit new request

---

## Commission Structure

**Default Commission: 15%**

Example calculation:
- Gross Earnings: $2,700 (15 completed rides)
- Commission (15%): -$405
- Net Payout: $2,295

The commission is automatically calculated when payout request is created.

---

## Payment Methods Supported

1. **Bank Transfer** (requires bank details)
2. **PayPal**
3. **Stripe**
4. **Cash**
5. **Check**

---

## Status Flow

```
pending → processing → completed
    ↓          ↓
cancelled   failed
```

- **pending**: Chauffeur submitted, waiting admin approval
- **processing**: Admin approved, payment in progress
- **completed**: Payment successfully sent
- **failed**: Payment rejected/failed
- **cancelled**: Chauffeur cancelled before processing

---

## Testing

Run the test script:
```bash
node backend/testPayoutSystem.js
```

This will:
- Find chauffeur with completed rides
- Calculate available balance
- Show existing payouts
- Create test payout request
- Display all API endpoints

---

## Integration with Existing Earnings

The payout system integrates seamlessly with the existing earnings display:

1. **Earnings Tab** shows:
   - Total earnings (all completed rides)
   - Daily/weekly/monthly breakdown
   - Pie chart visualization
   - Payment history table

2. **Payouts Section** (new) shows:
   - Available balance (unpaid earnings)
   - Payout request form
   - Payout history and status
   - Transaction details

Together they provide complete financial tracking for chauffeurs.

---

## Security Features

1. **Authentication**: All endpoints require JWT authentication
2. **Authorization**: Chauffeurs can only access their own payouts
3. **Duplicate Prevention**: Rides can only be paid once
4. **Status Validation**: Proper state transitions enforced
5. **Admin Approval**: Two-step process (approve then complete)

---

## Future Enhancements

1. Automatic payout scheduling (weekly/monthly)
2. Email notifications for status changes
3. Multiple payment methods per chauffeur
4. Bonus/penalty adjustments
5. Tax documentation (1099 forms)
6. Payment gateway integration
7. Real-time payment status tracking
8. Payout analytics dashboard
