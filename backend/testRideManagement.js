const http = require('http');

const API_URL = 'http://localhost:5000/api/admin';
let adminToken = '';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ data: parsed, status: res.statusCode });
          } else {
            reject({ response: { data: parsed, status: res.statusCode } });
          }
        } catch (e) {
          reject({ message: 'Failed to parse response', error: e });
        }
      });
    });

    req.on('error', (error) => reject({ message: error.message }));
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
};

// Admin login to get token
async function adminLogin() {
  try {
    log.info('Logging in as admin...');
    const response = await makeRequest(`${API_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: 'admin@rideserene.com',
        password: 'admin123456',
      },
    });

    adminToken = response.data.token;
    log.success(`Admin logged in successfully. Token: ${adminToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    log.error(`Admin login failed: ${error.response?.data?.message || error.message}`);
    log.warn('Make sure admin user exists. Run: node seedAdminUser.js');
    return false;
  }
}

// Test 1: Get all bookings
async function testGetAllBookings() {
  try {
    log.info('Testing: GET /bookings');
    const response = await makeRequest(`${API_URL}/bookings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    log.success(`Retrieved ${response.data.data.length} bookings`);
    log.info(`Total: ${response.data.total}, Pages: ${response.data.totalPages}`);
    return response.data.data[0]?._id; // Return first booking ID for other tests
  } catch (error) {
    log.error(`Get all bookings failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Test 2: Get booking statistics
async function testGetBookingStats() {
  try {
    log.info('Testing: GET /bookings/stats');
    const response = await makeRequest(`${API_URL}/bookings/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const stats = response.data.data;
    log.success('Booking statistics retrieved:');
    console.log(`   Total Bookings: ${stats.totalBookings}`);
    console.log(`   Pending: ${stats.pendingBookings}`);
    console.log(`   Confirmed: ${stats.confirmedBookings}`);
    console.log(`   In Progress: ${stats.inProgressBookings}`);
    console.log(`   Completed: ${stats.completedBookings}`);
    console.log(`   Cancelled: ${stats.cancelledBookings}`);
    console.log(`   Today's Bookings: ${stats.todaysBookings}`);
    console.log(`   Completed Revenue: $${stats.completedRevenue.toFixed(2)}`);
    console.log(`   Pending Revenue: $${stats.pendingRevenue.toFixed(2)}`);
  } catch (error) {
    log.error(`Get booking stats failed: ${error.response?.data?.message || error.message}`);
  }
}

// Test 3: Get booking by ID
async function testGetBookingById(bookingId) {
  if (!bookingId) {
    log.warn('Skipping get booking by ID test - no booking ID available');
    return;
  }

  try {
    log.info(`Testing: GET /bookings/${bookingId}`);
    const response = await makeRequest(`${API_URL}/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const booking = response.data.data;
    log.success(`Retrieved booking: ${booking.bookingReference}`);
    console.log(`   Customer: ${booking.customer?.firstName} ${booking.customer?.lastName}`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Total: $${booking.totalPrice}`);
    return booking;
  } catch (error) {
    log.error(`Get booking by ID failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Test 4: Search bookings
async function testSearchBookings() {
  try {
    log.info('Testing: Search bookings (GET /bookings?search=...)');
    const response = await makeRequest(`${API_URL}/bookings?search=BK`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    log.success(`Search returned ${response.data.data.length} results`);
  } catch (error) {
    log.error(`Search bookings failed: ${error.response?.data?.message || error.message}`);
  }
}

// Test 5: Filter by status
async function testFilterByStatus() {
  try {
    log.info('Testing: Filter by status (GET /bookings?status=pending)');
    const response = await makeRequest(`${API_URL}/bookings?status=pending`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    log.success(`Filter returned ${response.data.data.length} pending bookings`);
  } catch (error) {
    log.error(`Filter by status failed: ${error.response?.data?.message || error.message}`);
  }
}

// Test 6: Update booking status
async function testUpdateBookingStatus(bookingId) {
  if (!bookingId) {
    log.warn('Skipping update status test - no booking ID available');
    return;
  }

  try {
    log.info(`Testing: PUT /bookings/${bookingId}/status`);
    const response = await makeRequest(`${API_URL}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'confirmed' },
    });

    log.success(`Updated booking status to: ${response.data.data.status}`);
  } catch (error) {
    log.error(`Update booking status failed: ${error.response?.data?.message || error.message}`);
  }
}

// Test 7: Update booking details
async function testUpdateBookingDetails(bookingId) {
  if (!bookingId) {
    log.warn('Skipping update booking test - no booking ID available');
    return;
  }

  try {
    log.info(`Testing: PUT /bookings/${bookingId}`);
    const response = await makeRequest(`${API_URL}/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        notes: 'Test note added by API test script',
        specialRequests: 'Please ensure vehicle is clean',
      },
    });

    log.success('Updated booking details successfully');
  } catch (error) {
    log.error(`Update booking details failed: ${error.response?.data?.message || error.message}`);
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n=================================');
  console.log('🚗 Ride Management API Tests');
  console.log('=================================\n');

  // Step 1: Login
  const loginSuccess = await adminLogin();
  if (!loginSuccess) {
    log.error('Cannot proceed without admin authentication');
    process.exit(1);
  }

  console.log('\n--- Testing Booking Endpoints ---\n');

  // Step 2: Get all bookings
  const bookingId = await testGetAllBookings();
  
  console.log('');
  
  // Step 3: Get statistics
  await testGetBookingStats();
  
  console.log('');

  // Step 4: Get booking by ID
  await testGetBookingById(bookingId);
  
  console.log('');

  // Step 5: Search bookings
  await testSearchBookings();
  
  console.log('');

  // Step 6: Filter by status
  await testFilterByStatus();
  
  console.log('');

  // Step 7: Update booking status
  await testUpdateBookingStatus(bookingId);
  
  console.log('');

  // Step 8: Update booking details
  await testUpdateBookingDetails(bookingId);

  console.log('\n=================================');
  console.log('✅ All tests completed!');
  console.log('=================================\n');
}

// Run the tests
runAllTests().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
