# ADR 001 — Autenticação Dual-Token JWT

**Status:** Aceito  
**Data:** 2026-05-07  
**Aplica-se a:** Todos os boilerplates (Node/Fastify, Python/FastAPI, Ruby on Rails)

---

## Contexto

Os boilerplates precisam de uma estratégia de autenticação que:
- Suporte revogação de token (logout, exclusão de conta)
- Mantenha access tokens de curta duração por segurança
- Evite enviar credenciais a cada requisição

---

## Decisão

Usar **estratégia dual-token**:

| Token | Armazenamento | Duração | Finalidade |
|-------|---------------|---------|------------|
| **Access token** (JWT) | Header `Authorization: Bearer` | 15 min | Autenticar requisições à API |
| **Refresh token** (UUID opaco) | Cookie HTTP-only `SameSite=Lax` | 7 dias | Rotacionar access tokens |

Refresh tokens são persistidos no banco (`refresh_tokens`) e deletados no logout ou exclusão de conta. Isso garante revogação total sem blacklist de tokens.

### Payload do JWT

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

`jti` (JWT ID) incluído para futura revogação por token sem lookup no banco a cada requisição.

---

## Consequências

**Positivo:**
- Revogação é O(1): deletar linhas de `refresh_tokens`
- Access token é stateless — sem hit no banco a cada requisição
- Cookie HTTP-only previne roubo de token via XSS

**Trade-offs:**
- Tabela de refresh tokens adiciona escrita a cada rotação
- Janela de 15 minutos onde access token comprometido ainda é válido
- Refresh baseado em cookie exige `credentials: true` no CORS dos clientes

---

## Alternativas Consideradas

- **JWT único de longa duração**: sem capacidade de revogação — rejeitado
- **Auth baseada em sessão**: exige sticky sessions ou store compartilhado — fora do escopo do boilerplate
- **JWT curto + blacklist**: blacklist cresce sem limite — rejeitado
