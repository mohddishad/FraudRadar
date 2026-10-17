const http = require('http');

function req(method, path, data, headers = {}) {
  return new Promise((resolve) => {
    const postData = data ? JSON.stringify(data) : null;
    const request = http.request({
      host: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...headers,
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, headers: res.headers, body }); }
      });
    });
    request.on('error', (err) => resolve({ error: err.message }));
    if (postData) request.write(postData);
    request.end();
  });
}

async function verifySecurityHardening() {
  console.log('=== VERIFYING SECURITY HARDENING ===\n');

  // Step 0: Get a valid sample transaction ID
  const list = await req('GET', '/api/transactions?limit=1');
  const sampleId = list.data?.data?.[0]?._id;

  // 1. Verify Unauthenticated Analyst Action Blocked (401)
  console.log('1. Testing Unauthenticated PATCH /api/transactions/:id/status...');
  const unauthPatch = await req('PATCH', `/api/transactions/${sampleId}/status`, {
    status: 'CONFIRMED_FRAUD',
    analystNotes: 'Attempt without key'
  });
  console.log(`-> Status: ${unauthPatch.status} (Expected 401)`);
  console.log(`-> Message: ${unauthPatch.data?.message}`);
  const pass1 = unauthPatch.status === 401;

  // 2. Verify Authenticated Analyst Action Succeeds (200)
  console.log('\n2. Testing Authenticated PATCH with x-analyst-key header...');
  const authPatch = await req('PATCH', `/api/transactions/${sampleId}/status`, {
    status: 'CONFIRMED_FRAUD',
    analystNotes: 'Legitimate analyst verification with key'
  }, { 'x-analyst-key': 'fraudradar-analyst-secret-key-2026' });
  console.log(`-> Status: ${authPatch.status} (Expected 200)`);
  console.log(`-> Updated status: ${authPatch.data?.data?.status}`);
  const pass2 = authPatch.status === 200;

  // 3. Verify Regex / ReDoS Crash Defended
  console.log('\n3. Testing Safe Regex Search with unescaped "["...');
  const regexSearch = await req('GET', '/api/transactions?search=%5B');
  console.log(`-> Status: ${regexSearch.status} (Expected 200, no 500 crash)`);
  console.log(`-> Records returned: ${regexSearch.data?.data?.length}`);
  const pass3 = regexSearch.status === 200;

  // 4. Verify Invalid ObjectId Handling (400)
  console.log('\n4. Testing Invalid Transaction ID format...');
  const invalidIdRes = await req('PATCH', '/api/transactions/invalid-hex-12345/status', {
    status: 'DISMISSED'
  }, { 'x-analyst-key': 'fraudradar-analyst-secret-key-2026' });
  console.log(`-> Status: ${invalidIdRes.status} (Expected 400 Bad Request)`);
  console.log(`-> Message: ${invalidIdRes.data?.message}`);
  const pass4 = invalidIdRes.status === 400;

  // 5. Verify Type Confusion / Validation (400)
  console.log('\n5. Testing Object / Type Confusion on Transaction Creation...');
  const badTypeRes = await req('POST', '/api/transactions', {
    cardholderName: { injected: 'malicious' },
    amount: -50
  });
  console.log(`-> Status: ${badTypeRes.status} (Expected 400 Bad Request, no 500 crash)`);
  console.log(`-> Validation Errors:`, badTypeRes.data?.errors);
  const pass5 = badTypeRes.status === 400 && Array.isArray(badTypeRes.data?.errors);

  // 6. Verify Rate Limiting Headers
  console.log('\n6. Checking Rate Limiting Headers...');
  const healthRes = await req('GET', '/api/health');
  console.log(`-> RateLimit-Limit Header: ${healthRes.headers['ratelimit-limit']}`);
  console.log(`-> RateLimit-Remaining Header: ${healthRes.headers['ratelimit-remaining']}`);
  const pass6 = Boolean(healthRes.headers['ratelimit-limit']);

  // 7. Verify Security Headers
  console.log('\n7. Checking Security Response Headers...');
  console.log(`-> X-Content-Type-Options: ${healthRes.headers['x-content-type-options']}`);
  console.log(`-> X-Frame-Options: ${healthRes.headers['x-frame-options']}`);
  console.log(`-> X-XSS-Protection: ${healthRes.headers['x-xss-protection']}`);
  const pass7 = healthRes.headers['x-content-type-options'] === 'nosniff' && healthRes.headers['x-frame-options'] === 'DENY';

  console.log('\n=== SUMMARY OF TESTS ===');
  console.log(`1. Unauthenticated Action Blocked (401): ${pass1 ? 'PASS' : 'FAIL'}`);
  console.log(`2. Authenticated Action Permitted (200): ${pass2 ? 'PASS' : 'FAIL'}`);
  console.log(`3. ReDoS / Regex Defended (200): ${pass3 ? 'PASS' : 'FAIL'}`);
  console.log(`4. Invalid ID Rejected Cleanly (400): ${pass4 ? 'PASS' : 'FAIL'}`);
  console.log(`5. Type Confusion Rejected (400): ${pass5 ? 'PASS' : 'FAIL'}`);
  console.log(`6. Rate Limiting Active: ${pass6 ? 'PASS' : 'FAIL'}`);
  console.log(`7. Security Headers Present: ${pass7 ? 'PASS' : 'FAIL'}`);

  if (pass1 && pass2 && pass3 && pass4 && pass5 && pass6 && pass7) {
    console.log('\n🎉 ALL 7 SECURITY HARDENING CHECKS VERIFIED AND PASSED!');
    process.exit(0);
  } else {
    console.error('\n❌ SOME CHECKS FAILED');
    process.exit(1);
  }
}

verifySecurityHardening().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
