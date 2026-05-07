# Python / FastAPI Boilerplate

API REST com autenticação dual-token, Clean Architecture + DDD e ambiente Docker completo.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | FastAPI + Uvicorn |
| ORM + Migrations | SQLAlchemy 2.0 + Alembic |
| Banco de dados | PostgreSQL |
| Validação | Pydantic v2 |
| JWT | python-jose (HS256) |
| Hashing | passlib + bcrypt |
| Testes | pytest + pytest-cov |
| Lint | ruff |
| Telemetria | OpenTelemetry + Jaeger |
| Config | pydantic-settings + .env |

## Início rápido

```bash
cp .env.example .env
docker compose up
```

| Serviço | URL |
|---|---|
| API | http://localhost:8000 |
| Docs (Scalar) | http://localhost:8000/docs |
| Jaeger | http://localhost:16686 |

## Comandos

```bash
make dev      # Iniciar em modo dev (sem Docker)
make test     # Rodar testes com cobertura
make migrate  # Rodar migrations Alembic
make lint     # Verificar código (ruff check)
make format   # Formatar código (ruff format)
```

## Arquitetura

```
src/app/
├── core/          # Configurações transversais (DB, CORS, DI, settings, telemetria)
├── domain/        # Entidades, Value Objects, Role enum
├── http/          # Controllers (thin) + FastAPI Depends()
├── repositories/  # Interfaces abstratas + SQLAlchemy + InMemory (testes)
├── services/      # Use cases (RegisterUser, AuthenticateUser, RefreshToken…)
└── schemas/       # Pydantic schemas de request/response
```

**Fluxo de uma requisição:**
```
Request → Controller → Service (Use Case) → Repository → Response
```

## Autenticação

- `POST /auth/session` → `access_token` (JSON) + `refresh_token` (HTTP-only cookie, 7d)
- `PATCH /auth/refresh` → novo `access_token` via cookie (rotation automática)
- `PATCH /auth/logout` → revoga tokens, limpa cookie
- Rotas protegidas exigem `Authorization: Bearer <token>`

## Endpoints

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/health` | — | Health check |
| `POST` | `/auth/register` | — | Cadastro |
| `POST` | `/auth/session` | — | Login |
| `PATCH` | `/auth/refresh` | Cookie | Renovar token |
| `PATCH` | `/auth/logout` | Bearer | Logout |
| `GET` | `/users/me` | Bearer | Perfil |
| `PUT` | `/users/me` | Bearer | Atualizar perfil |
| `DELETE` | `/users/me` | Bearer | Deletar conta |

## Variáveis de ambiente

Copie `.env.example` e ajuste:

```env
DATABASE_URL=postgresql://docker:docker@db:5432/boilerplate
SECRET_KEY=troque-por-um-secret-forte
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
OTLP_ENDPOINT=http://jaeger:4317
```

## Load Testing

Uses [Locust](https://locust.io/) for stress and load testing, with a master/worker setup.

### Run

```bash
# Spin up isolated API + Locust via Docker (opens Web UI at localhost:8089)
make load-test

# Headless run (50 users, 5 spawn rate, 60s)
docker compose -f load-tests/docker-compose.loadtest.yml run --rm \
  locust-master --headless -u 50 -r 5 --run-time 60s

# Stop
docker compose -f load-tests/docker-compose.loadtest.yml down
```

### Scenarios

| Class | Scenario | Weight |
|-------|----------|--------|
| `AuthFlow` | register → login → refresh → logout | 3 |
| `AuthenticatedUser` | login → GET /users/me → PUT /users/me | 1 |

### Key Metrics (Locust Web UI at :8089)

| Metric | Target |
|--------|--------|
| Response time p95 | < 500 ms |
| Failure rate | < 1% |
| RPS | baseline for your hardware |
