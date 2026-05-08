# ADR 001 — Dual-Token JWT Authentication

**Status:** Accepted  
**Date:** 2026-05-07  
**Applies to:** All boilerplates (Node/Fastify, Python/FastAPI, Ruby on Rails)

---

## Context

The boilerplates need a stateful-ish auth strategy that:
- Supports token revocation (logout, account deletion)
- Keeps access tokens short-lived for security
- Avoids sending credentials on every request

---

## Decision

Use a **dual-token strategy**:

| Token | Storage | Lifetime | Purpose |
|-------|---------|---------|---------|
| **Access token** (JWT) | `Authorization: Bearer` header | 15 min | Authenticate API requests |
| **Refresh token** (opaque UUID) | HTTP-only `SameSite=Lax` cookie | 7 days | Rotate access tokens |

Refresh tokens are persisted in the database (`refresh_tokens` table) and deleted on logout or account deletion. This gives full revocation capability without a token blacklist.

### JWT payload

```json
{
  "sub": "<user_id>",
  "role": "<user_role>",
  "type": "access",
  "jti": "<uuid>",
  "iat": 1234567890,
  "exp": 1234568790
}
```

`jti` (JWT ID) is included for future per-token revocation without DB lookup on every request.

---

## Consequences

**Good:**
- Revocation is O(1): delete rows from `refresh_tokens`
- Access token is stateless; no DB hit on every request
- HTTP-only cookie prevents XSS token theft

**Trade-offs:**
- Refresh token DB table adds write on every token rotation
- 15-minute window where a compromised access token remains valid
- Cookie-based refresh requires CORS `credentials: true` from clients

---

## Alternatives Considered

- **Single long-lived JWT**: no revocation capability — rejected
- **Session-based auth**: requires sticky sessions or shared session store — out of scope for boilerplate
- **Short-lived JWT + blacklist**: blacklist grows unbounded — rejected
