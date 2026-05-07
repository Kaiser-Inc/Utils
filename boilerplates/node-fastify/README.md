# Node.js / Fastify Boilerplate

API REST com autenticação dual-token, Clean Architecture em TypeScript e ambiente Docker completo.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Fastify 5 + TypeScript |
| ORM + Migrations | Drizzle ORM + drizzle-kit |
| Banco de dados | PostgreSQL |
| Validação | Zod + fastify-type-provider-zod |
| JWT | @fastify/jwt (HS256) |
| Hashing | argon2 |
| Testes | Vitest |
| Lint / Format | Biome |
| Telemetria | OpenTelemetry + Jaeger |
| OpenAPI | @fastify/swagger + @scalar/fastify-api-reference |

## Início rápido

```bash
cp .env.example .env
docker compose up
```

| Serviço | URL |
|---|---|
| API | http://localhost:3000 |
| Docs (Scalar) | http://localhost:3000/docs |
| Jaeger | http://localhost:16686 |

## Comandos

```bash
make dev      # Iniciar em modo dev (tsx watch)
make test     # Rodar testes (Vitest)
make lint     # Verificar código (Biome)
make format   # Formatar código (Biome)
make migrate  # Rodar migrations Drizzle
make generate # Gerar arquivos de migration
```

## Arquitetura

```
src/app/
├── core/          # Servidor Fastify, DB, settings, CORS, segurança, telemetria
├── domain/        # Entidades, Value Objects, Role enum
├── http/
│   ├── controllers/
│   │   ├── auth/          # LoginController, RegisterController, RefreshController, LogoutController
│   │   ├── users/         # GetProfileController, UpdateProfileController, DeleteUserController
│   │   └── health.controller.ts
│   ├── middlewares/
│   │   └── authenticate.ts   # JWT verification hook
│   ├── routes/
│   │   ├── auth.routes.ts    # Fastify plugin — instantiates auth controllers
│   │   ├── users.routes.ts   # Fastify plugin — instantiates user controllers
│   │   └── health.routes.ts
│   └── schemas/
│       └── index.ts          # Zod schemas (UserSchema, AccessTokenSchema, etc.)
├── repositories/  # Interfaces TypeScript + Drizzle impl + InMemory (testes)
└── services/      # Use cases (RegisterUser, AuthenticateUser, RefreshToken…)
```

**Padrão de controllers:**
Cada controller é uma classe com a propriedade `handle` como arrow function (sem necessidade de `.bind()`). Repositórios injetados via constructor. `request.server` usado para acessar a instância do Fastify dentro dos handlers.

**Fluxo de uma requisição:**
```
Request → Route Plugin → Controller.handle → Service (Use Case) → Repository → Response
```

**Validação automática via ZodTypeProvider:**
O schema Zod declarado na rota serve como source of truth — valida o body, tipa o handler e gera o OpenAPI spec automaticamente. Sem `safeParse` manual.

## Autenticação

- `POST /auth/session` → `access_token` (JSON) + `refresh_token` (HTTP-only cookie, 7d)
- `PATCH /auth/refresh` → novo `access_token` via cookie (rotation automática)
- `PATCH /auth/logout` → revoga tokens, limpa cookie
- Rotas protegidas exigem `Authorization: Bearer <token>` (hook `authenticate`)

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

## Load Testing

Uses [k6](https://k6.io/) for stress and load testing.

### Run

```bash
# Spin up isolated API + k6 via Docker
make load-test

# Run users scenario
docker compose -f load-tests/docker-compose.loadtest.yml run --rm k6 run /scripts/users.js

# Run against a live server
k6 run -e BASE_URL=http://your-host:3000 load-tests/k6/auth.js
```

### Scenarios

| File | Scenario | VUs |
|------|----------|-----|
| `load-tests/k6/auth.js` | register → login → refresh → logout | 20 |
| `load-tests/k6/users.js` | login → GET /users/me → PUT /users/me | 10 |

### Key Metrics

| Metric | Target |
|--------|--------|
| `http_req_duration` p95 | < 500 ms |
| `http_req_failed` | < 1% |
| `auth_flow_success` rate | > 99% |

## Variáveis de ambiente

Copie `.env.example` e ajuste:

```env
DB_HOST=db
DB_PORT=5432
DB_NAME=boilerplate
DB_USER=docker
DB_PASSWORD=docker
SECRET_KEY=your-32-char-secret-key-here-xxxx
REFRESH_TOKEN_SECRET=your-32-char-refresh-secret-here-x
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200
OTLP_ENDPOINT=http://jaeger:4317
```
