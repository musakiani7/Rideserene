// Quick test to check if API is reachable
const fetch = require('node-fetch');

async function testAPI() {
  console.log('Testing API connection...\n');
  
  try {
    // Test 1: Check if backend is responding
    console.log('1. Testing backend health...');
    const healthResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' })
    });
    console.log('   Backend responding:', healthResponse.status);
    
    // Test 2: Try to login
    console.log('\n2. Testing login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'musa@gmail.com', password: 'password123' })
    });
    const loginData = await loginResponse.json();
    console.log('   Login status:', loginResponse.status);
    console.log('   Login success:', loginData.success);
    
    if (!loginData.success) {
      console.log('   ❌ Login failed:', loginData.message);
      return;
    }
    
    const token = loginData.token;
    console.log('   ✅ Token obtained:', token.substring(0, 20) + '...');
    
    // Test 3: Try to create booking
    console.log('\n3. Testing booking creation...');
    const bookingResponse = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        rideType: 'one-way',
        pickupLocation: {
          address: 'Test Pickup',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        dropoffLocation: {
          address: 'Test Dropoff',
          coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        pickupDate: new Date('2025-12-10').toISOString(),
        pickupTime: '14:00',
        vehicleClass: {
          id: 'business',
          name: 'Business Class',
          vehicle: 'Mercedes-Benz E-Class',
          passengers: 3,
          luggage: 2
        },
        passengerInfo: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+1234567890'
        },
        basePrice: 100,
        totalPrice: 100
      })
    });
    
    console.log('   Booking response status:', bookingResponse.status);
    const bookingData = await bookingResponse.json();
    console.log('   Booking response:', bookingData);
    
    if (bookingData.success) {
      console.log('   ✅ Booking created:', bookingData.booking.bookingReference);
    } else {
      console.log('   ❌ Booking failed:', bookingData.message);
      if (bookingData.errors) {
        console.log('   Validation errors:', bookingData.errors);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
