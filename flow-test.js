import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Performance metrics
export let reqs = new Trend('requests_per_sec', true);
export let p95 = new Trend('p95_latency');
export let errorRate = new Rate('error_rate');

// Configurable via env vars
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const MODE = __ENV.MODE || 'api'; // 'api' or 'frontend'
const TEACHER_CRED = { email: __ENV.TEACHER_EMAIL || 'teacher@demo.com', password: __ENV.TEACHER_PASSWORD || 'piyush@123' };
const ADMIN_CRED = { email: __ENV.ADMIN_EMAIL || 'admin@demo.com', password: __ENV.ADMIN_PASSWORD || 'Admin@123' };

export const options = {
  stages: [
    { duration: '1m', target: 500},
    { duration: '1m', target: 600 },
    { duration: '1m', target: 700 },
  ],
  thresholds: {
    'p95_latency': ['p(95)<500'],
    'error_rate': ['rate<0.01'],
    'http_req_failed': ['rate<0.01'],
  },
};

function record(resp) {
  reqs.add(1);
  p95.add(resp.timings.duration);
  const ok = check(resp, { 'status is 2xx': (r) => r.status >= 200 && r.status < 300 });
  if (!ok) {
    errorRate.add(1);
  }
}

function visitFrontendRoot() {
  // Fetch index.html and a couple of assets to simulate page load
  const urls = [
    `${BASE_URL}/`,
    `${BASE_URL}/index.html`,
  ];
  for (const u of urls) {
    const r = http.get(u, { timeout: '60s' });
    record(r);
    sleep(Math.random() * 0.5);
  }
}

function loginFlow(credentials) {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(credentials), {
    headers: { 'Content-Type': 'application/json' },
    timeout: '60s',
  });
  record(loginRes);

  if (loginRes.status !== 200) {
    return null;
  }

  const token = loginRes.json('token');
  return token;
}

function teacherFlow(token) {
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  group('Teacher dashboard flow', () => {
    // Fetch own schedule grid
    const schedule = http.get(`${BASE_URL}/api/schedules/mine/grid`, authHeaders);
    record(schedule);
    sleep(0.5 + Math.random() * 1.5);

    // Apply for a short leave (dates relative to now)
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 2);

    const leavePayload = {
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0],
      reason: 'k6 load test leave',
    };

    const leaveRes = http.post(`${BASE_URL}/api/leaves/apply`, JSON.stringify(leavePayload), {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      timeout: '60s',
    });
    record(leaveRes);
    sleep(0.5 + Math.random() * 1.5);

    // Check substitutions
    const subs = http.get(`${BASE_URL}/api/substitutions/mine`, authHeaders);
    record(subs);
    sleep(1 + Math.random() * 2);
  });
}

function adminFlow(token) {
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  group('Admin dashboard flow', () => {
    // View dashboard (proxy to /api/dashboard)
    const dash = http.get(`${BASE_URL}/api/dashboard`, authHeaders);
    record(dash);
    sleep(0.5 + Math.random() * 1.5);

    // Check notifications
    const notes = http.get(`${BASE_URL}/api/notifications`, authHeaders);
    record(notes);
    sleep(0.5 + Math.random() * 1.5);

    // Optionally generate substitutions: Pick a sample body
    const genPayload = {
      teacherId: __ENV.SAMPLE_TEACHER_ID || null,
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      // Do not supply schoolId from body; backend uses req.schoolId
    };

    // Only attempt generate when SAMPLE_TEACHER_ID is provided
    if (genPayload.teacherId) {
      const gen = http.post(`${BASE_URL}/api/substitutions/generate`, JSON.stringify(genPayload), {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        timeout: '60s',
      });
      record(gen);
      sleep(1 + Math.random() * 2);
    }
  });
}

export default function () {
  // Simulate either API-only or frontend flows
  if (MODE === 'frontend') {
    visitFrontendRoot();
  }

  // Randomly pick teacher or admin for each VU
  const isTeacher = Math.random() > 0.4; // 60% teacher, 40% admin
  const credentials = isTeacher ? TEACHER_CRED : ADMIN_CRED;

  const token = loginFlow(credentials);
  if (!token) {
    // login failed
    errorRate.add(1);
    fail('Login failed');
    return;
  }

  // After login navigate to dashboard flows
  if (isTeacher) {
    teacherFlow(token);
  } else {
    adminFlow(token);
  }

  // Logout: simply remove token client-side; for API tests we can hit no endpoint
  // Simulate some think time
  sleep(1 + Math.random() * 3);
}
