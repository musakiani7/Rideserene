const API_URL = 'http://localhost:5000/api';

async function testCustomerManagement() {
  try {
    // Login as admin
    console.log('Logging in...');
    const loginResponse = await fetch(`${API_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@rideserene.com',
        password: 'admin123',
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Status:', loginResponse.status);
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    console.log('✓ Logged in successfully\n');
    const token = loginData.token;

    // Test get all customers
    console.log('Testing get all customers...');
    const customersResponse = await fetch(`${API_URL}/admin/customers`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const customersData = await customersResponse.json();
    console.log('Status:', customersResponse.status);
    
    if (customersData.success) {
      console.log('✓ Customers retrieved successfully:');
      console.log(`  Total customers: ${customersData.data.length}`);
      if (customersData.data.length > 0) {
        const sample = customersData.data[0];
        console.log(`  Sample customer: ${sample.firstName} ${sample.lastName}`);
        console.log(`  Email: ${sample.email}`);
        console.log(`  Bookings: ${sample.bookingCount}`);
        console.log(`  Total spent: $${sample.totalSpent}`);
        
        // Test get customer by ID
        console.log('\nTesting get customer by ID...');
        const customerDetailsResponse = await fetch(`${API_URL}/admin/customers/${sample._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const customerDetailsData = await customerDetailsResponse.json();
        console.log('Status:', customerDetailsResponse.status);
        
        if (customerDetailsData.success) {
          console.log('✓ Customer details retrieved successfully:');
          console.log(`  Customer: ${customerDetailsData.data.customer.firstName} ${customerDetailsData.data.customer.lastName}`);
          console.log(`  Total bookings: ${customerDetailsData.data.stats.bookingCount}`);
          console.log(`  Total spent: $${customerDetailsData.data.stats.totalSpent}`);
          console.log(`  Recent bookings: ${customerDetailsData.data.bookings.length}`);
          
          if (customerDetailsData.data.bookings.length > 0) {
            console.log('\n  Sample booking:');
            const booking = customerDetailsData.data.bookings[0];
            console.log(`    Reference: ${booking.bookingReference}`);
            console.log(`    Status: ${booking.status}`);
            console.log(`    Total: $${booking.totalPrice}`);
          }
        } else {
          console.error('❌ Get customer details failed:', customerDetailsData.message);
        }
      }
    } else {
      console.error('❌ Get customers failed:', customersData.message);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCustomerManagement();
