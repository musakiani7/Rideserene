/**
 * Test Script for Ride Request Features
 * Tests: Create, Update, and Cancel ride requests
 * Run: node test-ride-requests.js
 */

const axios = require('axios');

const API_BASE = process.env.API_URL || 'http://localhost:5000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`),
};

let authToken = '';
let testBookingId = '';

// Test user credentials (must exist in database)
const testUser = {
  email: 'customer@test.com',
  password: 'password123',
};

// Test booking data
const createBookingData = {
  rideType: 'hourly',
  pickupLocation: {
    address: '123 Main Street, New York, NY',
    lat: 40.7128,
    lng: -74.0060,
  },
  dropoffLocation: {
    address: '',
    lat: 0,
    lng: 0,
  },
  pickupDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  pickupTime: '14:00',
  duration: 4,
  estimatedDistance: 0,
  estimatedArrivalTime: '14:00',
  vehicleClass: {
    name: 'Business Sedan',
    vehicle: 'Mercedes S-Class',
    basePrice: 100,
  },
  passengerInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
  },
  basePrice: 400,
  taxes: 0,
  fees: 0,
  discount: 0,
  totalPrice: 400,
  currency: 'USD',
};

const updateBookingData = {
  pickupLocation: {
    address: '456 Updated Avenue, New York, NY',
    lat: 40.7489,
    lng: -73.9680,
  },
  pickupDate: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
  pickupTime: '16:30',
  passengerInfo: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-9999',
  },
};

/**
 * Test 1: Login to get authentication token
 */
async function testLogin() {
  log.section('TEST 1: User Authentication');
  
  try {
    log.info('Attempting to login...');
    const response = await axios.post(`${API_BASE}/api/auth/login`, testUser);
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      log.success('Login successful');
      log.info(`Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      log.error('Login failed: No token received');
      return false;
    }
  } catch (error) {
    log.error(`Login failed: ${error.response?.data?.message || error.message}`);
    log.warning('Make sure you have a test user with credentials:');
    log.warning(`Email: ${testUser.email}, Password: ${testUser.password}`);
    return false;
  }
}

/**
 * Test 2: Create a new ride request
 */
async function testCreateRide() {
  log.section('TEST 2: Create Ride Request');
  
  try {
    log.info('Creating new ride request...');
    const response = await axios.post(
      `${API_BASE}/api/bookings`,
      createBookingData,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    
    if (response.data.success && response.data.booking) {
      testBookingId = response.data.booking.id;
      log.success('Ride request created successfully');
      log.info(`Booking Reference: ${response.data.booking.bookingReference}`);
      log.info(`Booking ID: ${testBookingId}`);
      log.info(`Total Price: $${response.data.booking.totalPrice}`);
      return true;
    } else {
      log.error('Failed to create ride request');
      return false;
    }
  } catch (error) {
    log.error(`Create ride failed: ${error.response?.data?.message || error.message}`);
    if (error.response?.data?.errors) {
      log.error('Validation errors:');
      error.response.data.errors.forEach(err => {
        log.error(`  - ${err.msg}`);
      });
    }
    return false;
  }
}

/**
 * Test 3: Get ride details
 */
async function testGetRide() {
  log.section('TEST 3: Get Ride Details');
  
  try {
    log.info(`Fetching ride details for ID: ${testBookingId}...`);
    const response = await axios.get(
      `${API_BASE}/api/bookings/${testBookingId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    
    if (response.data.success && response.data.booking) {
      const booking = response.data.booking;
      log.success('Ride details retrieved successfully');
      log.info(`Reference: ${booking.bookingReference}`);
      log.info(`Status: ${booking.status}`);
      log.info(`Ride Type: ${booking.rideType}`);
      log.info(`Pickup: ${booking.pickupLocation.address}`);
      log.info(`Date/Time: ${new Date(booking.pickupDate).toLocaleDateString()} at ${booking.pickupTime}`);
      log.info(`Vehicle: ${booking.vehicleClass.name} - ${booking.vehicleClass.vehicle}`);
      log.info(`Passenger: ${booking.passengerInfo.firstName} ${booking.passengerInfo.lastName}`);
      return true;
    } else {
      log.error('Failed to retrieve ride details');
      return false;
    }
  } catch (error) {
    log.error(`Get ride failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 4: Update ride request
 */
async function testUpdateRide() {
  log.section('TEST 4: Update Ride Request');
  
  try {
    log.info(`Updating ride request ID: ${testBookingId}...`);
    const response = await axios.put(
      `${API_BASE}/api/bookings/${testBookingId}`,
      updateBookingData,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    
    if (response.data.success && response.data.booking) {
      const booking = response.data.booking;
      log.success('Ride request updated successfully');
      log.info(`Reference: ${booking.bookingReference}`);
      log.info(`Updated Pickup: ${booking.pickupLocation.address}`);
      log.info(`Updated Date/Time: ${new Date(booking.pickupDate).toLocaleDateString()} at ${booking.pickupTime}`);
      log.info(`Updated Passenger: ${booking.passengerInfo.firstName} ${booking.passengerInfo.lastName}`);
      return true;
    } else {
      log.error('Failed to update ride request');
      return false;
    }
  } catch (error) {
    log.error(`Update ride failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 5: Get upcoming rides list
 */
async function testGetUpcomingRides() {
  log.section('TEST 5: Get Upcoming Rides List');
  
  try {
    log.info('Fetching upcoming rides...');
    const response = await axios.get(
      `${API_BASE}/api/dashboard/upcoming-rides`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    
    if (response.data.success) {
      const rides = response.data.data;
      log.success(`Retrieved ${rides.length} upcoming ride(s)`);
      rides.forEach((ride, index) => {
        log.info(`\nRide ${index + 1}:`);
        log.info(`  Reference: ${ride.bookingReference}`);
        log.info(`  Status: ${ride.status}`);
        log.info(`  Date: ${new Date(ride.pickupDate).toLocaleDateString()}`);
        log.info(`  Time: ${ride.pickupTime}`);
        log.info(`  Pickup: ${ride.pickupLocation.address}`);
      });
      return true;
    } else {
      log.error('Failed to retrieve upcoming rides');
      return false;
    }
  } catch (error) {
    log.error(`Get upcoming rides failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 6: Cancel ride request
 */
async function testCancelRide() {
  log.section('TEST 6: Cancel Ride Request');
  
  try {
    log.info(`Cancelling ride request ID: ${testBookingId}...`);
    const response = await axios.put(
      `${API_BASE}/api/bookings/${testBookingId}/cancel`,
      {
        cancellationReason: 'Test cancellation - automated test',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    
    if (response.data.success && response.data.booking) {
      log.success('Ride request cancelled successfully');
      log.info(`Reference: ${response.data.booking.bookingReference}`);
      log.info(`Status: ${response.data.booking.status}`);
      return true;
    } else {
      log.error('Failed to cancel ride request');
      return false;
    }
  } catch (error) {
    log.error(`Cancel ride failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n');
  log.section('RIDE REQUEST FEATURES - TEST SUITE');
  log.info(`API Base URL: ${API_BASE}`);
  log.info(`Test User: ${testUser.email}`);
  
  const results = {
    passed: 0,
    failed: 0,
    total: 6,
  };

  // Test 1: Login
  if (await testLogin()) {
    results.passed++;
  } else {
    results.failed++;
    log.error('Cannot proceed without authentication. Stopping tests.');
    printResults(results);
    return;
  }

  // Test 2: Create Ride
  if (await testCreateRide()) {
    results.passed++;
  } else {
    results.failed++;
    log.error('Cannot proceed without a booking. Stopping tests.');
    printResults(results);
    return;
  }

  // Test 3: Get Ride
  if (await testGetRide()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 4: Update Ride
  if (await testUpdateRide()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 5: Get Upcoming Rides
  if (await testGetUpcomingRides()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 6: Cancel Ride
  if (await testCancelRide()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Print final results
  printResults(results);
}

/**
 * Print test results summary
 */
function printResults(results) {
  log.section('TEST RESULTS SUMMARY');
  
  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`\nSuccess Rate: ${successRate}%\n`);
  
  if (results.passed === results.total) {
    log.success('All tests passed! ✨');
  } else if (results.failed === results.total) {
    log.error('All tests failed. Check your configuration and try again.');
  } else {
    log.warning('Some tests failed. Review the output above for details.');
  }
  
  console.log('\n');
}

// Run tests
runAllTests().catch(error => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
