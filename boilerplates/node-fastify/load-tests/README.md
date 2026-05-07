# Load Tests

k6 load testing for the Node/Fastify boilerplate.

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
docker compose -f load-tests/docker-compose.loadtest.yml run k6 run /scripts/users.js
```

### Against a live server

```bash
k6 run -e BASE_URL=http://your-host:3000 load-tests/k6/auth.js
```

## Key metrics to watch

| Metric | Target |
|--------|--------|
| `http_req_duration` (p95) | < 500ms |
| `http_req_failed` | < 1% |
| `auth_flow_success` | > 99% |
| `iterations` | steady throughput |

## Teardown

```bash
docker compose -f load-tests/docker-compose.loadtest.yml down
```
