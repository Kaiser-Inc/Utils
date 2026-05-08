import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const authFlowSuccess = new Rate('auth_flow_success');

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
  stages: [
    { duration: '30s', target: 20 },
    { duration: '60s', target: 20 },
    { duration: '10s', target: 0 },
  ],
};

function randomString() {
  return Math.random().toString(36).substring(2);
}

export default function () {
  const username = `user_${randomString()}`;
  const email = `${randomString()}@loadtest.com`;
  const password = `Pass_${randomString()}!1`;

  // Register
  const registerRes = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify({ username, email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const registerOk = check(registerRes, {
    'register status 201': (r) => r.status === 201,
  });

  if (!registerOk) {
    authFlowSuccess.add(0);
    return;
  }

  sleep(1);

  // Login
  const loginRes = http.post(
    `${BASE_URL}/auth/session`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const loginOk = check(loginRes, {
    'login status 201': (r) => r.status === 201,
    'login has accessToken': (r) => {
      try {
        return JSON.parse(r.body).accessToken !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (!loginOk) {
    authFlowSuccess.add(0);
    return;
  }

  const { accessToken } = JSON.parse(loginRes.body);

  sleep(1);

  // Refresh
  const refreshRes = http.patch(
    `${BASE_URL}/auth/refresh`,
    null,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const refreshOk = check(refreshRes, {
    'refresh status 200': (r) => r.status === 200,
    'refresh has accessToken': (r) => {
      try {
        return JSON.parse(r.body).accessToken !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (!refreshOk) {
    authFlowSuccess.add(0);
    return;
  }

  const newAccessToken = JSON.parse(refreshRes.body).accessToken;

  sleep(1);

  // Logout
  const logoutRes = http.patch(
    `${BASE_URL}/auth/logout`,
    null,
    { headers: { Authorization: `Bearer ${newAccessToken}` } }
  );

  const logoutOk = check(logoutRes, {
    'logout status 200': (r) => r.status === 200,
  });

  authFlowSuccess.add(registerOk && loginOk && refreshOk && logoutOk ? 1 : 0);

  sleep(1);
}
