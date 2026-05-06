# Ruby on Rails Boilerplate

API REST com autenticação dual-token, padrão Organizers + Interactors e ambiente Docker completo.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Rails 8.1 API-only |
| ORM + Migrations | ActiveRecord (built-in) |
| Banco de dados | PostgreSQL |
| Serialização | Blueprinter |
| JWT | gem `jwt` (HS256, custom — sem Devise) |
| Hashing | bcrypt (`has_secure_password`) |
| Service Layer | gem `interactor` (Organizers + Interactors) |
| Testes | RSpec + FactoryBot + Shoulda-Matchers |
| Lint | RuboCop (rubocop-rails-omakase) |
| Telemetria | opentelemetry-ruby + Jaeger |
| OpenAPI | rswag (spec + ui + api) |

## Início rápido

```bash
cp .env.example .env
docker compose up
```

| Serviço | URL |
|---|---|
| API | http://localhost:3000 |
| Docs (Scalar UI) | http://localhost:3000/scalar |
| Docs (Swagger UI) | http://localhost:3000/api-docs |
| Jaeger | http://localhost:16686 |

> `swagger.yaml` está pré-gerado em `swagger/v1/swagger.yaml`. Para regenerar: `make docs` (requer ambiente local com gems de desenvolvimento).

## Comandos

```bash
make setup    # Instalar gems + criar DB + rodar migrations
make dev      # Iniciar servidor Rails
make test     # Rodar RSpec
make docs     # Gerar swagger.yaml via rswag
make lint     # RuboCop
make migrate  # Rodar migrations pendentes
make console  # Rails console
```

## Arquitetura

```
app/
├── controllers/
│   ├── concerns/
│   │   └── authenticatable.rb   # JWT decode + current_user (concern)
│   ├── application_controller.rb # rescue_from centralizado
│   ├── auth_controller.rb
│   ├── users_controller.rb
│   └── health_controller.rb
├── errors/
│   └── application_errors.rb    # Hierarquia de erros de domínio
├── models/
│   ├── user.rb
│   └── refresh_token.rb
├── blueprints/
│   └── user_blueprint.rb        # Serialização segura (sem password_digest)
└── services/
    ├── application_service.rb   # Base com include Interactor
    ├── auth/
    │   ├── organizers/          # LoginOrganizer, RefreshTokenOrganizer…
    │   └── interactors/         # AuthenticateUser, GenerateTokens…
    └── users/
        ├── organizers/          # RegisterOrganizer, UpdateProfileOrganizer…
        └── interactors/         # CreateUser, UpdateUser, DeleteUser…
```

**Fluxo obrigatório em toda requisição:**
```
Request → Controller (thin, só HTTP)
        → Organizer (sempre presente, mesmo com 1 interactor)
        → Interactor(s) (passos de negócio)
        → Response (Blueprinter)
```

O controller nunca chama um Interactor diretamente — sempre passa por um Organizer. Isso garante consistência e facilita adicionar passos futuros sem tocar no controller.

**Tratamento de erros:**
Erros de domínio (`Errors::UnauthorizedError`, `Errors::EmailAlreadyInUseError`…) são lançados nos Interactors e capturados via `rescue_from` no `ApplicationController`. Zero repetição de `if result.success?` nos controllers.

## Autenticação

- `POST /auth/session` → `access_token` (JSON) + `refresh_token` (HTTP-only cookie, 7d)
- `PATCH /auth/refresh` → novo `access_token` via cookie (rotation automática, hash SHA-256 no banco)
- `PATCH /auth/logout` → revoga token, limpa cookie
- Rotas protegidas exigem `Authorization: Bearer <token>` (before_action via `Authenticatable`)

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
DATABASE_URL=postgresql://docker:docker@db:5432/boilerplate_development
RAILS_ENV=development
SECRET_KEY_BASE=troque-por-um-secret-forte
CORS_ORIGIN=http://localhost:4200
OTLP_ENDPOINT=http://jaeger:4317
```
