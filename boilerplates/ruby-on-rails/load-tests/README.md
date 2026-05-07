# Load Tests

k6 load tests for the Ruby on Rails boilerplate API (port 3000).

## Scenarios

| Script | VUs | Duration |
|--------|-----|----------|
| `auth.js` | 0→20→0 | ~100s |
| `users.js` | 0→10→0 | ~90s |

## Running

### Auth scenario (default)

```bash
make load-test
```

### Users scenario

```bash
docker compose -f load-tests/docker-compose.loadtest.yml run --rm k6 run /scripts/users.js
```

### Against a live server

```bash
BASE_URL=http://your-host:3000 k6 run load-tests/k6/auth.js
```

## Key metrics to watch

| Metric | Target |
|--------|--------|
| `http_req_duration` p95 | < 500ms |
| `http_req_failed` | < 1% |
| `auth_flow_success` | > 99% |

## Teardown

```bash
docker compose -f load-tests/docker-compose.loadtest.yml down
```
