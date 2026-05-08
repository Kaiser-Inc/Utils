# Contributing to KaiserInc-Utils

## Commit Convention

Uses [Conventional Commits](https://www.conventionalcommits.org/):

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

## Unified Error Response Spec

All boilerplates return errors in this exact shape:

```json
{
  "error": "Human-readable message"
}
```

HTTP status codes by error type:

| Error | Status |
|-------|--------|
| Invalid credentials | 401 |
| Missing / invalid token | 401 |
| Invalid refresh token | 401 |
| Resource not found | 404 |
| Email already in use | 409 |
| Username already taken | 409 |
| Validation failure (schema) | 400 / 422 |
| Unhandled server error | 500 |

> Future: add `"code": "ERROR_CODE"` field once all stacks are aligned.

---

## Feature Checklist (per boilerplate)

Every stack must implement all items before merging new features:

### Auth
- [ ] `POST /auth/register` — create user (hash password, validate uniqueness)
- [ ] `POST /auth/session` — login (return access token + set refresh cookie)
- [ ] `PATCH /auth/refresh` — rotate refresh token (HTTP-only cookie)
- [ ] `PATCH /auth/logout` — revoke all refresh tokens for user

### Users
- [ ] `GET /users/me` — authenticated profile
- [ ] `PUT /users/me` — update username / email
- [ ] `DELETE /users/me` — delete account + revoke tokens

### Security
- [ ] Access token via `Authorization: Bearer` header (15 min expiry)
- [ ] Refresh token via HTTP-only cookie (7 day expiry)
- [ ] `secure` cookie flag tied to `ENV=production`
- [ ] JWT payload includes `jti` (unique token ID)
- [ ] Global error handler catches all unhandled exceptions → 500
- [ ] Domain errors mapped to correct HTTP status codes

### Quality
- [ ] Unit tests for domain value objects
- [ ] Integration tests for all auth + user endpoints
- [ ] Load test scripts with `thresholds` (`p95 < 500ms`, `error_rate < 1%`)
- [ ] `make audit` target runs dependency vulnerability scan
- [ ] `make lint` passes with zero warnings
- [ ] `npx tsc --noEmit` (or equivalent) passes

### Documentation
- [ ] `README.md` — setup, env vars, make targets, architecture overview
- [ ] OpenAPI / Swagger UI available in development

---

## Adding a New Boilerplate Stack

1. Create `boilerplates/<stack-name>/` following the existing structure.
2. Implement all items in the Feature Checklist above.
3. Add a CI job to `.github/workflows/ci.yml`.
4. Add load test scripts to `load-tests/` or `boilerplates/<stack>/load-tests/`.
5. Update the root `README.md` with the new stack entry.
6. Add an ADR to `docs/adr/` if the stack introduces architectural decisions.

---

## Running Audits Locally

```bash
# Node/Fastify
cd boilerplates/node-fastify && make audit

# Python/FastAPI
cd boilerplates/python-fastapi && make audit

# Rails
cd boilerplates/ruby-on-rails && make audit
```

---

## Seed Data

Each boilerplate ships with a seed script that populates the database with development users:

| email | password | role |
|-------|----------|------|
| admin@example.com | password123 | admin |
| alice@example.com | password123 | user |
| bob@example.com | password123 | user |

```bash
make seed   # in each boilerplate directory
```

---

## Bruno API Collection

Each boilerplate ships an `api-collection/` folder importable in [Bruno](https://www.usebruno.com/).

**Import:** Bruno → Open Collection → select `boilerplates/<stack>/api-collection/`  
**Environment:** select `local` → points to `http://localhost:<PORT>`  
**Flow:** run _Login_ first → `accessToken` auto-saved → authenticated requests work.
