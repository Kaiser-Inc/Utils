# KaiserInc Boilerplates

Boilerplates prontos para uso, seguindo padrões arquiteturais consistentes entre stacks. Os backends implementam autenticação dual-token, Clean Architecture (adaptada para cada stack), documentação OpenAPI com Scalar e ambiente Docker completo. Os frontends integram com qualquer backend via contrato unificado e usam o Design System KaiserInc.

---

## Boilerplates disponíveis

### APIs (backend)

| Stack | Diretório | Porta padrão | README |
|---|---|---|---|
| Python / FastAPI | `python-fastapi/` | 8000 | [python-fastapi/README.md](python-fastapi/README.md) |
| Node.js / Fastify | `node-fastify/` | 3000 | [node-fastify/README.md](node-fastify/README.md) |
| Ruby on Rails | `ruby-on-rails/` | 3000 | [ruby-on-rails/README.md](ruby-on-rails/README.md) |

### Frontend

| Stack | Diretório | Porta padrão | README |
|---|---|---|---|
| Next.js 15 SaaS | `next-saas/` | 4000 | [next-saas/README.md](next-saas/README.md) |
| Expo / React Native | `expo-mobile/` | iOS / Android | [expo-mobile/README.md](expo-mobile/README.md) |

---

## Endpoints comuns (todos os boilerplates)

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `GET` | `/health` | — | Health check |
| `POST` | `/auth/register` | — | Cadastro de usuário |
| `POST` | `/auth/session` | — | Login → `access_token` + cookie `refresh_token` |
| `PATCH` | `/auth/refresh` | Cookie | Renovar access token |
| `PATCH` | `/auth/logout` | Bearer | Revogar tokens |
| `GET` | `/users/me` | Bearer | Perfil do usuário autenticado |
| `PUT` | `/users/me` | Bearer | Atualizar perfil |
| `DELETE` | `/users/me` | Bearer | Deletar conta |

---

## `python-fastapi/`

### Stack
- **Framework**: FastAPI + Uvicorn
- **ORM**: SQLAlchemy 2.0 + Alembic
- **Validação**: Pydantic v2
- **JWT**: python-jose (HS256)
- **Hashing**: passlib + bcrypt
- **Testes**: pytest + pytest-cov
- **Lint**: ruff
- **Telemetria**: OpenTelemetry + Jaeger
- **Docs**: scalar-fastapi → Scalar UI em `/docs`

### Arquitetura
**Clean Architecture + DDD**: Domain (Entities + Value Objects) → Services (Use Cases) → Repositories (Interfaces + SQLAlchemy/InMemory) → HTTP (Controllers + FastAPI DI)

### Início rápido
```bash
cd python-fastapi
cp .env.example .env
docker compose up
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
# Jaeger: http://localhost:16686
```

### Comandos
```bash
make dev      # Iniciar em modo dev (sem Docker)
make test     # Rodar testes com cobertura
make lint     # Verificar código
make format   # Formatar código
make migrate  # Rodar migrations Alembic
```

---

## `node-fastify/`

### Stack
- **Framework**: Fastify 5 + TypeScript
- **ORM**: Drizzle ORM + drizzle-kit
- **Validação**: Zod + fastify-type-provider-zod
- **JWT**: @fastify/jwt
- **Hashing**: argon2
- **Testes**: Vitest
- **Lint/Format**: Biome
- **Telemetria**: OpenTelemetry + Jaeger
- **Docs**: @fastify/swagger + @scalar/fastify-api-reference → Scalar UI em `/docs`

### Arquitetura
**Clean Architecture**: Domain (Entities + Value Objects) → Services (Use Cases) → Repositories (Interfaces + Drizzle/InMemory) → HTTP (Route Handlers + Fastify hooks)

### Início rápido
```bash
cd node-fastify
cp .env.example .env
docker compose up
# API:    http://localhost:3000
# Docs:   http://localhost:3000/docs
# Jaeger: http://localhost:16686
```

### Comandos
```bash
make dev      # Iniciar em modo dev
make test     # Rodar testes
make lint     # Verificar código
make format   # Formatar código
make migrate  # Rodar migrations
```

---

## `ruby-on-rails/`

### Stack
- **Framework**: Rails 8.1 API-only
- **ORM**: ActiveRecord + migrations
- **Serialização**: Blueprinter
- **JWT**: gem `jwt` (HS256, custom — sem Devise)
- **Hashing**: bcrypt (`has_secure_password`)
- **Service Layer**: gem `interactor` (Organizers + Interactors)
- **Testes**: RSpec + FactoryBot + Shoulda-Matchers
- **Lint**: RuboCop (rubocop-rails-omakase)
- **Telemetria**: opentelemetry-ruby + Jaeger
- **Docs**: rswag → Scalar UI em `/scalar` + Swagger UI em `/api-docs`

### Arquitetura
**Organizers + Interactors**: Todo fluxo segue `Controller → Organizer → Interactor(s) → Response (Blueprinter)`. Sem exceções, mesmo com um único interactor. Erros de domínio centralizados via `rescue_from`.

### Início rápido
```bash
cd ruby-on-rails
cp .env.example .env
docker compose up
# API:          http://localhost:3000
# Docs (Scalar):http://localhost:3000/scalar
# Docs (Swagger):http://localhost:3000/api-docs
# Jaeger:       http://localhost:16686
```

### Comandos
```bash
make setup    # Instalar gems + criar DB + seed
make dev      # Iniciar servidor
make test     # Rodar specs
make docs     # Gerar swagger.yaml (rswag)
make lint     # RuboCop
make migrate  # Rodar migrations
make console  # Rails console
```

---

## Padrões de auth (comuns a todos)

```
# Registro
POST /auth/register
{ "username": "pedro", "email": "pedro@example.com", "password": "secret123" }
→ 201: { "id": "...", "username": "pedro", "email": "...", "role": "user" }

# Login
POST /auth/session
{ "email": "pedro@example.com", "password": "secret123" }
→ 200: { "access_token": "eyJ...", "token_type": "bearer" }
→ Set-Cookie: refresh_token=<token>; HttpOnly; SameSite=Lax

# Uso do access token
GET /users/me
Authorization: Bearer eyJ...
→ 200: { "id": "...", "username": "pedro", ... }

# Refresh (cookie automático)
PATCH /auth/refresh
Cookie: refresh_token=<token>
→ 200: { "access_token": "eyJ..." }

# Logout
PATCH /auth/logout
Authorization: Bearer eyJ...
→ 204 No Content
```

---

## Estrutura de diretórios

```
boilerplates/
├── python-fastapi/     # Clean Architecture + DDD (FastAPI)
├── node-fastify/       # Clean Architecture adaptada (Fastify + TypeScript)
├── ruby-on-rails/      # Organizers + Interactors (Rails API)
├── next-saas/          # Next.js 15 App Router — SaaS autenticado
└── expo-mobile/        # Expo SDK 52 + Expo Router v4 — Mobile autenticado
```
