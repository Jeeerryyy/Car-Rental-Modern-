import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * tests/load/k6-load-test.js
 * k6 Load Testing Script
 * 
 * Simulates high concurrency load against the production endpoints.
 * It is executed automatically by the CI/CD pipeline before a Blue-Green deployment swap.
 * Fails the deployment if the p95 latency exceeds 200ms.
 */

export const options = {
  // Simulate up to 1000 concurrent Virtual Users over a 1-minute ramp-up
  stages: [
    { duration: '30s', target: 500 }, // Ramp up to 500 users
    { duration: '1m', target: 1000 }, // Stay at 1000 users for 1 minute
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    // 95% of requests must complete within 200ms
    http_req_duration: ['p(95)<200'],
    // Less than 1% of requests are allowed to fail
    http_req_failed: ['rate<0.01'], 
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:5000';

export default function () {
  // Simulate a user viewing the public car listing page
  const res = http.get(`${BASE_URL}/api/cars`);

  check(res, {
    'is status 200': (r) => r.status === 200,
    'has data': (r) => r.body.includes('data'),
  });

  // Wait for 1 second between requests to simulate real human read time
  sleep(1);
}
