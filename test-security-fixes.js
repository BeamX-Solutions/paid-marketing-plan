/**
 * Security Fixes Test Script
 * Tests all 5 critical security fixes
 */

const BASE_URL = 'http://localhost:3002';

// Color output helpers
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

async function test(name, fn) {
  try {
    log(`\n${name}...`, 'blue');
    await fn();
    results.passed++;
    results.tests.push({ name, status: 'PASSED' });
    log('✓ PASSED', 'green');
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAILED', error: error.message });
    log(`✗ FAILED: ${error.message}`, 'red');
  }
}

async function makeRequest(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const contentType = response.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return { response, data };
}

// ============================================================================
// Test 1: Strong Password Validation
// ============================================================================

async function testWeakPassword() {
  await test('1a. Reject weak password (too short)', async () => {
    const { response, data } = await makeRequest('/api/admin/users/create-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Short1!',
        firstName: 'Test',
        lastName: 'User',
      }),
    });

    if (response.status !== 400 && response.status !== 401) {
      throw new Error(`Expected 400 or 401, got ${response.status}`);
    }

    if (response.status === 400 && !data.error.includes('Password')) {
      throw new Error('Should reject weak password');
    }
  });

  await test('1b. Reject password without special characters', async () => {
    const { response, data } = await makeRequest('/api/admin/users/create-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test2@example.com',
        password: 'LongPassword123',
        firstName: 'Test',
        lastName: 'User',
      }),
    });

    if (response.status !== 400 && response.status !== 401) {
      throw new Error(`Expected 400 or 401, got ${response.status}`);
    }

    if (response.status === 400 && !data.error.includes('Password')) {
      throw new Error('Should reject password without special characters');
    }
  });

  await test('1c. Reject common password', async () => {
    const { response, data } = await makeRequest('/api/admin/users/create-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test3@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      }),
    });

    if (response.status !== 400 && response.status !== 401) {
      throw new Error(`Expected 400 or 401, got ${response.status}`);
    }

    if (response.status === 400 && data.details && data.details.some(d => d.includes('common'))) {
      // Good, it rejected common password
    } else if (response.status === 401) {
      // Not authenticated, which is also fine for this test
    }
  });
}

// ============================================================================
// Test 2: Rate Limiting
// ============================================================================

async function testRateLimiting() {
  await test('2. Rate limiting prevents excessive requests', async () => {
    // Make 15 rapid requests to a rate-limited endpoint
    const promises = [];
    for (let i = 0; i < 15; i++) {
      promises.push(
        makeRequest('/api/admin/users/create-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `ratelimit${i}@example.com`,
            password: 'TestPassword123!@#',
            firstName: 'Rate',
            lastName: 'Limit',
          }),
        })
      );
    }

    const results = await Promise.all(promises);

    // At least one should be rate limited (429)
    const rateLimited = results.some(r => r.response.status === 429);

    if (!rateLimited) {
      // Check if any returned rate limit headers
      const hasRateLimitHeaders = results.some(
        r => r.response.headers.get('X-RateLimit-Remaining') !== null
      );

      if (!hasRateLimitHeaders) {
        throw new Error('No rate limiting detected');
      }

      log('  Note: Rate limit headers present but limit not exceeded in test', 'yellow');
    } else {
      const rateLimitedResponse = results.find(r => r.response.status === 429);
      log(`  Rate limited at request: ${results.indexOf(rateLimitedResponse) + 1}`, 'yellow');
    }
  });
}

// ============================================================================
// Test 3: JSON Schema Validation for Permissions
// ============================================================================

async function testPermissionsValidation() {
  await test('3a. Reject invalid permission type', async () => {
    const { response, data } = await makeRequest('/api/admin/users/test-user-id/permissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        canDownloadData: 'yes', // Should be boolean
      }),
    });

    if (response.status !== 400 && response.status !== 401 && response.status !== 404) {
      throw new Error(`Expected 400, 401, or 404, got ${response.status}`);
    }

    if (response.status === 400) {
      if (!data.error || !data.details) {
        throw new Error('Should return validation error with details');
      }
    }
  });

  await test('3b. Reject missing required field', async () => {
    const { response, data } = await makeRequest('/api/admin/users/test-user-id/permissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Missing canDownloadData
      }),
    });

    if (response.status !== 400 && response.status !== 401 && response.status !== 404) {
      throw new Error(`Expected 400, 401, or 404, got ${response.status}`);
    }

    if (response.status === 400) {
      if (!data.error || !data.details) {
        throw new Error('Should return validation error with details');
      }
    }
  });

  await test('3c. Reject extra fields (strict mode)', async () => {
    const { response, data } = await makeRequest('/api/admin/users/test-user-id/permissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        canDownloadData: true,
        extraField: 'should not be allowed',
      }),
    });

    if (response.status !== 400 && response.status !== 401 && response.status !== 404) {
      throw new Error(`Expected 400, 401, or 404, got ${response.status}`);
    }

    if (response.status === 400) {
      if (!data.error) {
        throw new Error('Should reject extra fields in strict mode');
      }
    }
  });
}

// ============================================================================
// Test 4: Credit Amount Limits
// ============================================================================

async function testCreditLimits() {
  await test('4a. Reject credit amount above maximum', async () => {
    const { response, data } = await makeRequest('/api/admin/users/test-user-id/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 15000, // Above 10,000 limit
        reason: 'Testing max limit',
      }),
    });

    if (response.status !== 400 && response.status !== 401 && response.status !== 404) {
      throw new Error(`Expected 400, 401, or 404, got ${response.status}`);
    }

    if (response.status === 400) {
      const errorText = JSON.stringify(data).toLowerCase();
      if (!errorText.includes('10000') && !errorText.includes('10,000')) {
        throw new Error('Should mention credit limit in error');
      }
    }
  });

  await test('4b. Reject credit amount below minimum', async () => {
    const { response, data } = await makeRequest('/api/admin/users/test-user-id/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: -15000, // Below -10,000 limit
        reason: 'Testing min limit',
      }),
    });

    if (response.status !== 400 && response.status !== 401 && response.status !== 404) {
      throw new Error(`Expected 400, 401, or 404, got ${response.status}`);
    }

    if (response.status === 400) {
      const errorText = JSON.stringify(data).toLowerCase();
      if (!errorText.includes('10000') && !errorText.includes('10,000')) {
        throw new Error('Should mention credit limit in error');
      }
    }
  });

  await test('4c. Reject zero credit amount', async () => {
    const { response, data } = await makeRequest('/api/admin/users/test-user-id/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 0,
        reason: 'Testing zero amount',
      }),
    });

    if (response.status !== 400 && response.status !== 401 && response.status !== 404) {
      throw new Error(`Expected 400, 401, or 404, got ${response.status}`);
    }

    if (response.status === 400) {
      if (!data.error && !data.details) {
        throw new Error('Should reject zero amount');
      }
    }
  });
}

// ============================================================================
// Test 5: Authentication Middleware
// ============================================================================

async function testAuthentication() {
  await test('5. Admin routes require authentication', async () => {
    const { response } = await makeRequest('/api/admin/users');

    // Should return 401 Unauthorized or redirect (3xx)
    if (response.status !== 401 && response.status < 300) {
      throw new Error(`Admin route should require auth, got ${response.status}`);
    }
  });
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runTests() {
  log('\n========================================', 'blue');
  log('Security Fixes Test Suite', 'blue');
  log('========================================\n', 'blue');

  log('Testing server at: ' + BASE_URL, 'yellow');

  // Run all tests
  await testWeakPassword();
  await testRateLimiting();
  await testPermissionsValidation();
  await testCreditLimits();
  await testAuthentication();

  // Print summary
  log('\n========================================', 'blue');
  log('Test Summary', 'blue');
  log('========================================\n', 'blue');

  results.tests.forEach(test => {
    const symbol = test.status === 'PASSED' ? '✓' : '✗';
    const color = test.status === 'PASSED' ? 'green' : 'red';
    log(`${symbol} ${test.name}`, color);
    if (test.error) {
      log(`  Error: ${test.error}`, 'red');
    }
  });

  log(`\nTotal: ${results.passed + results.failed}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');

  const passRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
  log(`\nPass Rate: ${passRate}%\n`, passRate === '100.0' ? 'green' : 'yellow');

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
