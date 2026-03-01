const axios = require('axios');

async function testCustomerAPI() {
  try {
    console.log('Testing Customer Management API...\n');
    
    // First, login as admin to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/admin/auth/login', {
      email: 'admin@rideserene.com',
      password: 'admin123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful\n');
    
    // Test getting all customers
    console.log('2. Fetching all customers...');
    const customersResponse = await axios.get('http://localhost:5000/api/admin/customers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Found ${customersResponse.data.total} customers`);
    console.log('\nCustomer List:');
    customersResponse.data.data.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.firstName} ${customer.lastName}`);
      console.log(`   Email: ${customer.email}`);
      console.log(`   Phone: ${customer.phone}`);
      console.log(`   Bookings: ${customer.bookingCount}`);
      console.log(`   Total Spent: $${customer.totalSpent}`);
      console.log('');
    });
    
    // Test getting a specific customer
    if (customersResponse.data.data.length > 0) {
      const firstCustomerId = customersResponse.data.data[0]._id;
      console.log(`3. Fetching customer details for ${customersResponse.data.data[0].firstName} ${customersResponse.data.data[0].lastName}...`);
      
      const customerResponse = await axios.get(`http://localhost:5000/api/admin/customers/${firstCustomerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Customer details retrieved successfully');
      console.log('Customer Data:', JSON.stringify(customerResponse.data.data.customer, null, 2));
      console.log('\n📊 All tests passed! Customer Management API is working correctly.');
    }
    
  } catch (error) {
    console.error('❌ Error testing Customer API:', error.response?.data || error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n⚠️  Backend server is not running. Start it with: npm start');
    }
  }
}

testCustomerAPI();
