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
make dev        # Iniciar em modo dev (tsx watch)
make test       # Rodar testes (Vitest)
make lint       # Verificar código (Biome)
make format     # Formatar código (Biome)
make migrate    # Rodar migrations Drizzle
make generate   # Gerar arquivos de migration
make seed       # Popular banco com dados de dev
make audit      # Checar vulnerabilidades (npm audit --audit-level=high)
make load-test  # Rodar k6 via Docker
make metrics    # Coletar métricas e gerar relatório
```

## Dados de desenvolvimento

Popula o banco com 3 usuários:

```bash
make seed
```

| email | senha | role |
|-------|-------|------|
| admin@example.com | password123 | admin |
| alice@example.com | password123 | user |
| bob@example.com | password123 | user |

## Bruno — API Collection

Coleção completa de requests em `api-collection/`.

1. Abra [Bruno](https://www.usebruno.com/) → **Open Collection** → selecione `boilerplates/node-fastify/api-collection/`
2. Selecione environment **local** (aponta para `http://localhost:3000`)
3. Execute **Login** primeiro — `accessToken` salvo automaticamente
4. Demais requests já usam o token salvo

## Arquitetura

```
src/app/
├── core/          # Servidor Fastify, DB, settings, CORS, segurança, telemetria
├── domain/        # Entidades, Value Objects, Role enum
├── http/
│   ├── controllers/
│   │   ├── auth/          # LoginController, RegisterController, RefreshController, LogoutController
│   │   ├── users/         # GetProfileController, UpdateProfileController, DeleteUserController
│   │   └── health.ts
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
Cada controller é uma classe com a propriedade `handle` como arrow function (sem necessidade de `.bind()`). Services são injetados via constructor (não instanciados dentro do `handle`), o que permite testar controllers em isolamento sem depender do container. `request.server` usado para acessar a instância do Fastify dentro dos handlers.

**Fluxo de uma requisição:**
```
Request → Route Plugin → Controller.handle → Service (Use Case) → Repository → Response
```

**Validação automática via ZodTypeProvider:**
O schema Zod declarado na rota serve como source of truth — valida o body, tipa o handler e gera o OpenAPI spec automaticamente. Sem `safeParse` manual.

**Error handler global:**
O handler global mapeia `DomainError` para os status HTTP corretos (401 Unauthorized, 404 Not Found, 409 Conflict) e preserva os erros de validação do Zod como 400 Bad Request. Erros inesperados retornam 500, mas erros de domínio conhecidos nunca são engolidos como 500.

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

Utiliza [k6](https://k6.io/) para testes de carga e estresse.

### Execução

```bash
# Sobe API isolada + k6 via Docker
make load-test

# Roda cenário de usuários
docker compose -f load-tests/docker-compose.loadtest.yml run --rm k6 run /scripts/users.js

# Roda contra servidor externo
k6 run -e BASE_URL=http://seu-host:3000 load-tests/k6/auth.js
```

### Cenários

| Arquivo | Cenário | VUs |
|---------|---------|-----|
| `load-tests/k6/auth.js` | register → login → refresh → logout | 20 |
| `load-tests/k6/users.js` | login → GET /users/me → PUT /users/me | 10 |

### Métricas

| Métrica | Meta |
|---------|------|
| `http_req_duration` p95 | < 500 ms |
| `http_req_failed` | < 1% |
| Taxa `auth_flow_success` | > 99% |

## Métricas de Qualidade

```bash
make metrics
```

Gera relatórios em `metrics/` (JSON + Markdown). Requer `npm run test:coverage` para cobertura.

| Ferramenta | Métrica | Referência |
|------------|---------|------------|
| TypeScript-ESTree (AST) | Complexidade Ciclomática McCabe | McCabe, 1976 |
| AST (Halstead) | Halstead (volume, esforço, bugs estimados) | Halstead, 1977 |
| Fórmula MI | Índice de Manutenibilidade (0–100) | Oman & Hagemeister, 1992 |
| Biome | Score de lint (0–10) + issues | — |
| Vitest + V8 | Cobertura reportada + cobertura real (c/ exclusões documentadas) | — |
| npm audit | Vulnerabilidades de segurança | — |

> A cobertura reportada exclui arquivos de infraestrutura sem lógica testável (`main.ts`, `telemetry.ts`, `database.ts`, repositórios Drizzle). O relatório exibe ambos os valores: `reported_coverage` e `real_coverage`.

## Variáveis de ambiente

Copie `.env.example` e ajuste:

```env
DB_HOST=db
DB_PORT=5432
DB_NAME=boilerplate
DB_USER=postgres
DB_PASSWORD=postgres
SECRET_KEY=your-32-char-secret-key-here-xxxx
REFRESH_TOKEN_SECRET=your-32-char-refresh-secret-here-x
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200
OTLP_ENDPOINT=http://jaeger:4317
```
