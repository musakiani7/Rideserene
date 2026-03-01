const axios = require('axios');

async function testTodayRidesAPI() {
  try {
    // You need to replace this token with a valid chauffeur token from localStorage
    // For now, let's try to login first
    console.log('🔐 Attempting chauffeur login...');
    
    const loginResponse = await axios.post('http://localhost:5000/api/chauffeur/auth/login', {
      email: 'musa@gmail.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    
    console.log('\n📊 Fetching today\'s rides...');
    const ridesResponse = await axios.get('http://localhost:5000/api/chauffeur/dashboard/today-rides', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\n✅ API Response:');
    console.log('Success:', ridesResponse.data.success);
    console.log('Count:', ridesResponse.data.count);
    console.log('\nRides:');
    
    if (ridesResponse.data.data && ridesResponse.data.data.length > 0) {
      ridesResponse.data.data.forEach((ride, index) => {
        console.log(`\nRide ${index + 1}:`);
        console.log(`  Reference: ${ride.bookingReference}`);
        console.log(`  Status: ${ride.status}`);
        console.log(`  Date: ${ride.pickupDate}`);
        console.log(`  Time: ${ride.pickupTime}`);
        console.log(`  Customer: ${ride.customer?.firstName} ${ride.customer?.lastName}`);
        console.log(`  Chauffeur: ${ride.chauffeur ? `${ride.chauffeur.firstName} ${ride.chauffeur.lastName}` : 'Not assigned'}`);
      });
    } else {
      console.log('❌ No rides returned');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testTodayRidesAPI();
