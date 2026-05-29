# ADR 002 — Domain-Driven Design: Camada de Domínio

**Status:** Aceito  
**Data:** 2026-05-07  
**Aplica-se a:** Todos os boilerplates (Node/Fastify, Python/FastAPI, Ruby on Rails)

---

## Contexto

Os boilerplates precisam de uma estrutura consistente que:
- Separe regras de negócio da infraestrutura (HTTP, banco)
- Torne a lógica de domínio testável sem subir servidor ou conectar ao banco
- Ofereça um padrão claro para extensão ao adicionar novas features

---

## Decisão

Cada boilerplate implementa uma **camada de domínio** leve:

```
domain/
  entities/      # Tipos de dados puros / modelos de domínio (User, RefreshToken)
  errors/        # Erros de domínio tipados (EmailAlreadyInUseError, etc.)
  value-objects/ # Primitivos validados (Email, Username, Password)
```

**Regras:**
1. Entidades de domínio **não importam frameworks** — apenas primitivos da linguagem
2. Value objects **validam na construção** e lançam erros de domínio em caso de falha
3. Erros de domínio têm nomes semânticos (não códigos HTTP) — o mapeamento para HTTP acontece na camada de transporte

### Mapeamento HTTP (camada de transporte)

```
InvalidCredentialsError   → 401
UnauthorizedError         → 401
InvalidRefreshTokenError  → 401
UserNotFoundError         → 404
EmailAlreadyInUseError    → 409
UsernameAlreadyTakenError → 409
<outro DomainError>       → 422
```

O error handler global (`setErrorHandler` / exception handler do FastAPI / `rescue_from`) é responsável por esse mapeamento. Controllers nunca definem códigos HTTP para erros de domínio diretamente.

---

## Consequências

**Positivo:**
- Lógica de domínio 100% testável em unitário — sem mock de HTTP
- Adicionar novo transporte (gRPC, CLI) exige apenas um novo adaptador, sem alterar o domínio
- Semântica de erros explícita e pesquisável

**Trade-offs:**
- Camada extra para CRUD simples — aceitável como padrão de boilerplate
- Desenvolvedores precisam distinguir "erro de domínio" de "erro de validação" — documentado no CONTRIBUTING.md

---

## Alternativas Consideradas

- **Modelo anêmico (sem camada de domínio)**: validação espalhada nos controllers — rejeitado por manutenibilidade
- **DDD completo com aggregates + eventos**: excessivo para boilerplate de auth — postergado para código específico de cada aplicação
