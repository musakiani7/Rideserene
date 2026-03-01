const http = require('http');

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
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        try {
          const parsed = JSON.parse(data);
          resolve({ data: parsed, status: res.statusCode });
        } catch (e) {
          reject({ message: 'Failed to parse response', error: e, raw: data });
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

async function testStats() {
  try {
    // Login first
    console.log('Logging in...');
    const loginResponse = await makeRequest('http://localhost:5000/api/admin/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@rideserene.com',
        password: 'admin123456',
      },
    });

    const token = loginResponse.data.token;
    console.log('✓ Logged in successfully\n');

    // Test stats endpoint
    console.log('Testing stats endpoint...');
    const statsResponse = await makeRequest('http://localhost:5000/api/admin/bookings/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('✓ Stats retrieved successfully:');
    console.log(JSON.stringify(statsResponse.data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testStats();
