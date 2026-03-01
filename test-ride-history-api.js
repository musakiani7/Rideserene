// Test script to check ride history API endpoint
const fetch = require('node-fetch');

async function testRideHistoryAPI() {
  console.log('\n=== TESTING RIDE HISTORY API ===\n');
  
  // First, let's try to login to get a token
  console.log('Step 1: Logging in as musa@gmail.com...');
  
  try {
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'musa@gmail.com',
        password: 'password123' // You may need to adjust this
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.log('\n❌ Login failed. Please check the password.');
      console.log('Try logging in through the frontend to verify credentials.');
      return;
    }
    
    const token = loginData.token;
    console.log('\n✅ Login successful! Token:', token.substring(0, 20) + '...');
    
    // Now test the ride history endpoint
    console.log('\nStep 2: Fetching ride history...');
    
    const historyResponse = await fetch('http://localhost:5000/api/dashboard/ride-history?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const historyData = await historyResponse.json();
    console.log('\nRide history response:', JSON.stringify(historyData, null, 2));
    
    if (historyData.success) {
      console.log(`\n✅ API working! Found ${historyData.count} bookings.`);
      if (historyData.data && historyData.data.length > 0) {
        console.log('\nFirst booking details:');
        console.log('- Reference:', historyData.data[0].bookingReference);
        console.log('- Status:', historyData.data[0].status);
        console.log('- From:', historyData.data[0].pickupLocation?.address);
        console.log('- To:', historyData.data[0].dropoffLocation?.address);
      }
    } else {
      console.log('\n❌ API returned error:', historyData.message);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testRideHistoryAPI();
