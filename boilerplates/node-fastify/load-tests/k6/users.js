import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
  stages: [
    { duration: '20s', target: 10 },
    { duration: '60s', target: 10 },
    { duration: '10s', target: 0 },
  ],
};

function randomString() {
  return Math.random().toString(36).substring(2);
}

export function setup() {
  const username = `setup_${randomString()}`;
  const email = `${randomString()}@loadtest.com`;
  const password = `Pass_${randomString()}!1`;

  const registerRes = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify({ username, email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (registerRes.status !== 201) {
    throw new Error(`Setup register failed: ${registerRes.status} ${registerRes.body}`);
  }

  const loginRes = http.post(
    `${BASE_URL}/auth/session`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (loginRes.status !== 201) {
    throw new Error(`Setup login failed: ${loginRes.status} ${loginRes.body}`);
  }

  const { accessToken } = JSON.parse(loginRes.body);
  return { accessToken };
}

export default function (data) {
  const { accessToken } = data;
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  // GET /users/me
  const getMeRes = http.get(`${BASE_URL}/users/me`, authHeaders);

  check(getMeRes, {
    'GET /users/me status 200': (r) => r.status === 200,
    'GET /users/me has id': (r) => {
      try {
        return JSON.parse(r.body).id !== undefined;
      } catch {
        return false;
      }
    },
    'GET /users/me has username': (r) => {
      try {
        return JSON.parse(r.body).username !== undefined;
      } catch {
        return false;
      }
    },
  });

  sleep(1);

  const newUsername = `updated_${randomString()}`;

  // PUT /users/me
  const updateRes = http.put(
    `${BASE_URL}/users/me`,
    JSON.stringify({ username: newUsername }),
    authHeaders
  );

  check(updateRes, {
    'PUT /users/me status 200': (r) => r.status === 200,
    'PUT /users/me returns updated username': (r) => {
      try {
        return JSON.parse(r.body).username === newUsername;
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}
