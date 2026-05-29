# Contribuindo com o KaiserInc-Utils

## Convenção de Commits

Utiliza [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

feat(node): add rate limiting to auth routes
fix(python): replace deprecated passlib with bcrypt
docs(rails): update JWT jti documentation
chore(ci): add audit step to workflow
```

**Types:** `feat` | `fix` | `docs` | `refactor` | `test` | `chore` | `perf`  
**Scopes:** `node` | `python` | `rails` | `ci` | `docs` | `root`

---

## Especificação Unificada de Resposta de Erro

Todos os boilerplates retornam erros neste formato exato:

```json
{
  "error": "Mensagem legível por humanos"
}
```

Códigos de status HTTP por tipo de erro:

| Erro | Status |
|------|--------|
| Credenciais inválidas | 401 |
| Token ausente / inválido | 401 |
| Refresh token inválido | 401 |
| Recurso não encontrado | 404 |
| E-mail já em uso | 409 |
| Username já cadastrado | 409 |
| Falha de validação (schema) | 400 / 422 |
| Erro de servidor não tratado | 500 |

> Futuro: adicionar campo `"code": "ERROR_CODE"` quando todos os stacks estiverem alinhados.

---

## Checklist de Funcionalidades (por boilerplate)

Cada stack deve implementar todos os itens antes de fazer merge de novas funcionalidades:

### Auth
- [ ] `POST /auth/register` — criar usuário (hash de senha, validar unicidade)
- [ ] `POST /auth/session` — login (retornar access token + definir cookie de refresh)
- [ ] `PATCH /auth/refresh` — rotacionar refresh token (cookie HTTP-only)
- [ ] `PATCH /auth/logout` — revogar todos os refresh tokens do usuário

### Usuários
- [ ] `GET /users/me` — perfil autenticado
- [ ] `PUT /users/me` — atualizar username / e-mail
- [ ] `DELETE /users/me` — deletar conta + revogar tokens

### Segurança
- [ ] Access token via header `Authorization: Bearer` (expiração em 15 min)
- [ ] Refresh token via cookie HTTP-only (expiração em 7 dias)
- [ ] Flag `secure` do cookie vinculada a `ENV=production`
- [ ] Payload do JWT inclui `jti` (ID único do token)
- [ ] Handler global de erros captura todas as exceções não tratadas → 500
- [ ] Erros de domínio mapeados para os códigos de status HTTP corretos

### Qualidade
- [ ] Testes unitários para objetos de valor do domínio
- [ ] Testes de integração para todos os endpoints de auth + usuários
- [ ] Scripts de load test com `thresholds` (`p95 < 500ms`, `error_rate < 1%`)
- [ ] Target `make audit` executa varredura de vulnerabilidades nas dependências
- [ ] `make lint` passa sem nenhum warning
- [ ] `npx tsc --noEmit` (ou equivalente) passa

### Documentação
- [ ] `README.md` — setup, variáveis de ambiente, make targets, visão geral da arquitetura
- [ ] OpenAPI / Swagger UI disponível em desenvolvimento

---

## Checklist Anti-Regressão (revisão de PR)

Execute antes de abrir um PR que altere qualquer boilerplate.

### Geral
- [ ] Nenhum `package-lock.json` ou `yarn.lock` tracked (`git ls-files | grep -E 'package-lock|yarn.lock'` → vazio)
- [ ] Nenhum `.env` tracked (`git ls-files | grep -E '^\.env$|/\.env$'` → vazio)
- [ ] Nenhum `coverage/`, `coverage.json`, `htmlcov/`, `.coverage`, `tsconfig.tsbuildinfo` tracked

### Node (node-fastify / next-saas / expo-mobile)
- [ ] Lockfile canônico: `pnpm-lock.yaml` — nunca `package-lock.json`
- [ ] `pnpm install --frozen-lockfile` passa sem error
- [ ] Nenhuma dep beta com caret (`^x.x.x-beta.y`) — use versão pinada
- [ ] `@tanstack/react-query-devtools` em `devDependencies`, não em `dependencies`
- [ ] `pnpm audit --audit-level=high` limpo

### Python (python-fastapi)
- [ ] `core/cors.py` lê origins de `settings.cors_origin` (não hardcoded)
- [ ] `core/database.py` usa `echo=settings.environment == "development"`
- [ ] `core/openapi.py` define `PUBLIC_PATHS` e skipa BearerAuth nos públicos
- [ ] `ruff check src tests` limpo
- [ ] `pytest` verde

### Ruby (ruby-on-rails)
- [ ] JWT encoding usa `ENV.fetch("SECRET_KEY")` — não `Rails.application.secret_key_base`
- [ ] `decode_jwt` rescue `JWT::DecodeError` relança `Errors::InvalidTokenError` (não retorna nil)
- [ ] `bundle exec rubocop` limpo nos arquivos modificados
- [ ] `bundle-audit check --update` limpo

### CI
- [ ] Jobs Node usam `pnpm/action-setup@v4` + `cache: "pnpm"` + `pnpm install --frozen-lockfile`
- [ ] `cache-dependency-path` aponta para `pnpm-lock.yaml` (não `package-lock.json`)

---

## Adicionando um Novo Stack de Boilerplate

1. Crie `boilerplates/<stack-name>/` seguindo a estrutura existente.
2. Implemente todos os itens do Checklist de Funcionalidades acima.
3. Adicione um job de CI em `.github/workflows/ci.yml`.
4. Adicione scripts de load test em `load-tests/` ou `boilerplates/<stack>/load-tests/`.
5. Atualize o `README.md` raiz com a entrada do novo stack.
6. Adicione um ADR em `docs/adr/` caso o stack introduza decisões arquiteturais.

---

## Executando Audits Localmente

```bash
# Node/Fastify
cd boilerplates/node-fastify && make audit

# Python/FastAPI
cd boilerplates/python-fastapi && make audit

# Rails
cd boilerplates/ruby-on-rails && make audit
```

---

## Métricas & Dashboard

`make metrics` em cada boilerplate gera `metrics/report_*.json` (CC/MI/Halstead/cobertura/
lint/segurança) no schema consumido pelo **KaiserInc-MetriK** (`~/KaiserInc/KaiserInc-MetriKa/`).
Visualize via Docker local (mount da pasta `metrics/`, `METRICS_DIR=/metrics`) ou pela versão
web (upload no file picker). A skill `/KaiserInc-SetupMetriK` automatiza setup + dashboard.
Ao alterar um `scripts/metrics.*`, mantenha as chaves do schema (ver `docs/report-schema.md`
no repo do MetriK) para não quebrar a ingestão.

---

## Seed Data

Cada boilerplate inclui um script de seed que popula o banco de dados com usuários de desenvolvimento:

| email | password | role |
|-------|----------|------|
| admin@example.com | password123 | admin |
| alice@example.com | password123 | user |
| bob@example.com | password123 | user |

```bash
make seed   # em cada diretório de boilerplate
```

---

## Coleção Bruno API

Cada boilerplate inclui uma pasta `api-collection/` importável no [Bruno](https://www.usebruno.com/).

**Importar:** Bruno → Open Collection → selecione `boilerplates/<stack>/api-collection/`  
**Ambiente:** selecione `local` → aponta para `http://localhost:<PORT>`  
**Fluxo:** execute _Login_ primeiro → `accessToken` salvo automaticamente → requisições autenticadas funcionam.
