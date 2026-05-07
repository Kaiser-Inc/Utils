# Load Tests

Locust-based load testing suite for the FastAPI boilerplate.

## Running

### Full stack (recommended)

```bash
# From the boilerplate root:
make load-test

# Or directly:
docker compose -f load-tests/docker-compose.loadtest.yml up --build
```

Access the Locust Web UI at **http://localhost:8089**, set your desired user count and spawn rate, then click **Start**.

### Headless (CI / scripted)

```bash
docker compose -f load-tests/docker-compose.loadtest.yml run --rm locust-master \
  -f /locustfile.py \
  --headless \
  -u 50 \
  -r 5 \
  --run-time 60s \
  --host http://api:8000
```

| Flag | Meaning |
|------|---------|
| `-u 50` | Total simulated users |
| `-r 5` | Users spawned per second |
| `--run-time 60s` | Stop after 60 seconds |

### Stopping

```bash
docker compose -f load-tests/docker-compose.loadtest.yml down
```

---

## User classes

| Class | Scenario |
|-------|----------|
| `AuthFlow` | register → login → refresh → logout |
| `AuthenticatedUser` | login → GET /users/me → PUT /users/me |

---

## Key metrics to watch

| Metric | Healthy target | Action if breached |
|--------|---------------|--------------------|
| **RPS** (requests/s) | Stable under load | Check worker count, DB connections |
| **p95 response time** | < 500 ms | Profile slow endpoints, add indexes |
| **Failure rate** | < 1 % | Check logs: `docker compose logs api` |
| **p99 response time** | < 1 000 ms | Look for lock contention or N+1 queries |

Locust reports these in real time on the **Statistics** tab and as a downloadable CSV.

---

## Scaling workers

```bash
docker compose -f load-tests/docker-compose.loadtest.yml up --scale locust-worker=4
```

Each worker handles its own user slice; master aggregates all results.
