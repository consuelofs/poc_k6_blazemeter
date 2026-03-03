/**
 * k6 Hello World Test
 *
 * A simple load test that sends a GET request to the target URL,
 * validates the response, and reports basic metrics.
 *
 * Run locally:
 *   k6 run k6-tests/hello-world.js
 *
 * Run with custom VUs and duration:
 *   k6 run --vus 5 --duration 30s k6-tests/hello-world.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, DEFAULT_HEADERS, DEFAULT_THRESHOLDS, logStep } from './config.js';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: DEFAULT_THRESHOLDS,
};

export default function () {
  logStep('Sending GET request to ' + BASE_URL);

  const res = http.get(BASE_URL, { headers: DEFAULT_HEADERS });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
    'body is not empty': (r) => r.body && r.body.length > 0,
  });

  sleep(1);
}
