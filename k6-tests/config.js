// Shared configuration and helper utilities for k6 tests

export const BASE_URL = 'https://demoblaze.com';

// Common headers for GET requests
export const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (k6-load-test)',
  'Accept-Encoding': 'gzip, deflate',
};

// Additional headers for requests that send a JSON body (POST/PUT/PATCH)
export const JSON_HEADERS = {
  ...DEFAULT_HEADERS,
  'Content-Type': 'application/json',
};

// Default thresholds for all tests
export const DEFAULT_THRESHOLDS = {
  http_req_duration: ['p(95)<2000'], // 95% of requests must complete within 2s
  http_req_failed: ['rate<0.05'],    // Error rate must be below 5%
};

// Helper: build full URL from path
export function url(path = '') {
  return `${BASE_URL}${path}`;
}

// Helper: log a step with timestamp
export function logStep(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}
