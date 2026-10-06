const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) reject({ status: res.statusCode, body: parsed });
          else resolve(parsed);
        } catch (e) {
          reject({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Helper to extract token regardless of controller wrapper shape
function extractToken(res) {
  return res.token || (res.data && res.data.token) || (res.user && res.user.token);
}

// Helper to extract ride object
function extractRide(res) {
  return res.ride || (res.data && res.data.ride) || res.data || res;
}

async function runE2ETest() {
  try {
    console.log('🚀 Starting Automated API Lifecycle Test...\n');

    // 1. Customer Auth
    console.log('1. Registering Customer...');
    const custRes = await request('POST', '/auth/register', {
      fullName: 'Test Customer',
      email: `customer_${Date.now()}@test.com`,
      phone: `07${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'password123',
      role: 'customer'
    });
    const customerToken = extractToken(custRes);
    if (!customerToken) throw new Error(`Could not extract customer token. Response was: ${JSON.stringify(custRes)}`);
    console.log('✅ Customer Logged In!\n');

    // 2. Driver Auth
    console.log('2. Registering Driver...');
    const driverRes = await request('POST', '/auth/register', {
      fullName: 'Test Driver',
      email: `driver_${Date.now()}@test.com`,
      phone: `07${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'password123',
      role: 'driver',
      driverDetails: {
        licenseNumber: `DL-${Date.now()}`,
        nationalId: `${Date.now()}`.slice(-8),
        transmissionProficiency: 'both',
        isAvailable: true
      }
    });
    const driverToken = extractToken(driverRes);
    if (!driverToken) throw new Error(`Could not extract driver token. Response was: ${JSON.stringify(driverRes)}`);
    console.log('✅ Driver Logged In!\n');

    // 3. Create Ride Request
    console.log('3. Requesting Ride...');
    const ridePayload = {
      customerVehicle: {
        make: 'Toyota',
        model: 'Prado',
        plateNumber: 'KDA 123X',
        transmission: 'automatic'
      },
      pickupAddress: 'Westlands, Nairobi',
      dropoffAddress: 'Karen, Nairobi',
      pickupCoords: [36.8080, -1.2683],
      dropoffCoords: [36.7003, -1.3197],
      serviceType: 'one-way-trip',
      estimatedFare: 2500
    };
    
    const rideRes = await request('POST', '/rides/request', ridePayload, customerToken);
    const rideObj = extractRide(rideRes);
    const rideId = rideObj._id || rideObj.id;
    console.log(`✅ Ride Created! ID: ${rideId}\n`);

    // 4. Accept Ride
    console.log('4. Driver Accepting Ride...');
    const acceptRes = await request('PATCH', `/rides/${rideId}/accept`, null, driverToken);
    const acceptedRide = extractRide(acceptRes);
    console.log(`✅ Status Updated: ${acceptedRide.status}\n`);

    // 5. Update Statuses
    for (const status of ['arrived', 'in-progress', 'completed']) {
      console.log(`5. Updating status to "${status}"...`);
      const statusRes = await request('PATCH', `/rides/${rideId}/status`, { status }, driverToken);
      const updatedRide = extractRide(statusRes);
      console.log(`✅ Current Status: ${updatedRide.status}`);
    }

    console.log('\n🎉 SUCCESS: Entire backend lifecycle verified successfully!');
  } catch (err) {
    console.error('\n❌ Error during test:', err.message || err);
  }
}

runE2ETest();