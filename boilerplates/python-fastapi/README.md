# Python / FastAPI Boilerplate

API REST com autenticação dual-token, Clean Architecture + DDD e ambiente Docker completo.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | FastAPI + Uvicorn |
| ORM + Migrations | SQLAlchemy 2.0 + Alembic |
| Banco de dados | PostgreSQL |
| Validação | Pydantic v2 |
| JWT | PyJWT (HS256) |
| Hashing | bcrypt (direto, sem wrapper) |
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
make dev             # Iniciar em modo dev (sem Docker)
make test            # Rodar testes com cobertura
make migrate         # Rodar migrations Alembic
make lint            # Verificar código (ruff check)
make format          # Formatar código (ruff format)
make seed            # Popular banco com dados de dev
make audit           # Checar vulnerabilidades (pip-audit)
make load-test       # Rodar Locust via Docker
make metrics-install # Instalar ferramentas de métricas
make metrics         # Coletar métricas e gerar relatório
```

## Métricas de Qualidade

Suporte a coleta de métricas estáticas e dinâmicas para análise comparativa e estudos acadêmicos.

### Instalação

```bash
make metrics-install
```

### Coleta

```bash
make metrics
```

Gera dois arquivos em `metrics/`:
- `report_YYYY-MM-DD_HHMMSS.json` — dados brutos + sumário estruturado
- `report_YYYY-MM-DD_HHMMSS.md` — relatório legível para inclusão em documentos

### Métricas coletadas

| Ferramenta | Métrica | Referência acadêmica |
|------------|---------|----------------------|
| `radon cc` | Complexidade ciclomática (McCabe) | McCabe, 1976 — IEEE |
| `radon mi` | Índice de manutenibilidade (0–100) | Oman & Hagemeister, 1992 |
| `radon hal` | Halstead (volume, esforço, bugs estimados) | Halstead, 1977 |
| `pylint` | Score de qualidade (0–10) + issues por categoria | — |
| `xenon` | Enforcement de thresholds de complexidade | — |
| `pytest-cov` | Cobertura de testes (%) | — |

### Interpretação

**Complexidade ciclomática (CC):**
A ≤ 5 (simples) → B ≤ 10 → C ≤ 15 → D ≤ 20 → E ≤ 25 → F > 25 (instável)

**Índice de manutenibilidade (MI):**
≥ 20 = alta manutenibilidade | 10–19 = moderada | < 10 = baixa

**Bugs estimados (Halstead):**
Estimativa matemática de defeitos latentes com base em operadores e operandos.

### Uso para comparativo

Para comparar projeto antigo vs. novo, colete em ambos e compare os JSONs:

```bash
# No projeto antigo
python scripts/metrics.py --output-dir comparativo/antigo

# No projeto novo
python scripts/metrics.py --output-dir comparativo/novo
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

1. Abra [Bruno](https://www.usebruno.com/) → **Open Collection** → selecione `boilerplates/python-fastapi/api-collection/`
2. Selecione environment **local** (aponta para `http://localhost:8000`)
3. Execute **Login** primeiro — `accessToken` salvo automaticamente
4. Demais requests já usam o token salvo

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

## Dependências de segurança

- `bcrypt` — hashing de senhas (sem wrapper, direto)
- `PyJWT` — geração e validação de tokens JWT (substitui python-jose)
- Cookie `refresh_token`: `secure=True` em produção (`ENV=production`)

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

Utiliza [Locust](https://locust.io/) para testes de carga e estresse, com setup master/worker.

### Execução

```bash
# Sobe API isolada + Locust via Docker (UI disponível em localhost:8089)
make load-test

# Execução headless (50 usuários, taxa 5/s, duração 60s)
docker compose -f load-tests/docker-compose.loadtest.yml run --rm \
  locust-master --headless -u 50 -r 5 --run-time 60s

# Parar
docker compose -f load-tests/docker-compose.loadtest.yml down
```

### Cenários

| Classe | Cenário | Peso |
|--------|---------|------|
| `AuthFlow` | register → login → refresh → logout | 3 |
| `AuthenticatedUser` | login → GET /users/me → PUT /users/me | 1 |

### Métricas (UI Locust em :8089)

| Métrica | Meta |
|---------|------|
| Tempo de resposta p95 | < 500 ms |
| Taxa de falha | < 1% |
| RPS | baseline do seu hardware |

> Metas de SLA: p95 < 500ms, taxa de falha < 1% — aplicadas via `--exit-code-on-error 1`
