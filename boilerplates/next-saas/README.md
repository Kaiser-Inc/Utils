# Next.js SaaS Boilerplate

Aplicação web SaaS com autenticação JWT, App Router e integração com qualquer backend KaiserInc.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 App Router |
| TypeScript | 5 strict |
| Auth | NextAuth v5 (Auth.js) — Credentials → backend JWT |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 |
| Forms | React Hook Form + Zod |
| UI | shadcn/ui + Tailwind CSS v4 |
| Lint / Format | Biome |
| Testes unitários | Vitest + Testing Library |
| Testes E2E | Playwright |

## Início rápido

```bash
cp .env.example .env
npm install
npm run dev
```

| Serviço | URL |
|---|---|
| App | http://localhost:4000 |
| Login | http://localhost:4000/login |
| Dashboard | http://localhost:4000/dashboard |

> Requer backend KaiserInc rodando em `BACKEND_URL` (padrão: `http://localhost:3000`).

## Comandos

```bash
make dev          # Servidor Next.js em modo dev
make build        # Build de produção
make test         # Testes unitários (Vitest)
make test-coverage # Testes com cobertura
make e2e          # Testes E2E (Playwright)
make lint         # Verificar código (Biome)
make format       # Formatar código (Biome)
make typecheck    # Verificar tipos TypeScript
make audit        # Checar vulnerabilidades
make metrics      # Relatório CC/MI/Halstead + cobertura
```

## Compatibilidade de backend

Integra com qualquer backend KaiserInc via `BACKEND_URL`:

```bash
# Com node-fastify
BACKEND_URL=http://localhost:3000

# Com python-fastapi
BACKEND_URL=http://localhost:8000

# Com ruby-on-rails
BACKEND_URL=http://localhost:3000
```

Contrato esperado:

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `POST` | `/auth/session` | — | Login |
| `POST` | `/auth/register` | — | Cadastro |
| `PATCH` | `/auth/refresh` | Cookie | Renovar token |
| `PATCH` | `/auth/logout` | Bearer | Logout |
| `GET` | `/users/me` | Bearer | Perfil |
| `PUT` | `/users/me` | Bearer | Atualizar perfil |
| `DELETE` | `/users/me` | Bearer | Deletar conta |

## Arquitetura

```
src/
├── app/
│   ├── layout.tsx                   # Root layout + Providers
│   ├── (public)/                    # Rotas públicas (sem sidebar)
│   │   ├── page.tsx                 # Landing
│   │   ├── login/page.tsx           # Formulário NextAuth signIn
│   │   └── register/page.tsx        # Cadastro via /auth/register
│   ├── (app)/                       # Rotas autenticadas
│   │   ├── layout.tsx               # Sidebar + Topbar
│   │   ├── dashboard/page.tsx       # RSC com fetch autenticado
│   │   └── settings/page.tsx        # Atualização de perfil
│   └── api/auth/[...nextauth]/      # Handler NextAuth
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── layout/                      # Sidebar, Topbar, Providers
│   └── shared/                      # Componentes reutilizáveis
├── lib/
│   ├── auth/
│   │   ├── auth.ts                  # NextAuth config + Credentials
│   │   └── session.ts               # requireAuth(), getSession()
│   ├── api/
│   │   ├── client.ts                # Fetch wrapper type-safe
│   │   └── endpoints/               # auth.ts, users.ts
│   └── utils.ts                     # cn(), formatDate(), truncate()
├── hooks/
│   └── use-user.ts                  # Hook client-side de sessão
├── stores/
│   └── ui-store.ts                  # Zustand: sidebar, tema
└── types/
    ├── auth.d.ts                    # Augmentation NextAuth session
    └── api.d.ts                     # Tipos de resposta backend
```

## Auth Flow

```
Login form
  → server action signIn("credentials", { email, password })
  → Credentials.authorize()
      → POST BACKEND_URL/auth/session → { access_token }
      → GET  BACKEND_URL/users/me    → { user }
  → JWT session: { accessToken, id, username, role }

middleware.ts:
  → auth() verifica sessão
  → rotas (app)/ sem sessão → redirect /login

RSC data fetch:
  → const session = await auth()
  → apiClient(path, { token: session.accessToken })
```

## Variáveis de ambiente

Copie `.env.example` e ajuste:

```env
BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=http://localhost:4000
```

## Qualidade

| Métrica | Target |
|---------|--------|
| CC avg | ≤ 5 (grau A) |
| MI avg | ≥ 75 |
| Cobertura | ≥ 80% |
| Lint | 0 erros (Biome) |
| Segurança | 0 high/critical |
