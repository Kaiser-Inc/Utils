# Next.js SaaS Boilerplate

Aplicação web SaaS com autenticação JWT, App Router e integração com qualquer backend KaiserInc.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 App Router |
| Package manager | pnpm ≥ 9 |
| TypeScript | 5 strict |
| Auth | NextAuth v5 (Auth.js) — Credentials → backend JWT |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 |
| Forms | React Hook Form + Zod |
| UI | @kaiserinc/react v0.2 — dark-first design system |
| Lint / Format | Biome |
| Testes unitários | Vitest + Testing Library |
| Testes E2E | Playwright |

## Início rápido

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

| Rota | URL |
|---|---|
| Info / Landing | http://localhost:4000 |
| Login | http://localhost:4000/login |
| Dashboard | http://localhost:4000/dashboard |
| Componentes | http://localhost:4000/components |

> Requer backend KaiserInc rodando em `BACKEND_URL` (padrão: `http://localhost:3000`).

## Comandos

```bash
pnpm dev           # Servidor Next.js em modo dev
pnpm build         # Build de produção
pnpm test          # Testes unitários (Vitest)
pnpm test:coverage # Testes com cobertura
pnpm e2e           # Testes E2E (Playwright)
pnpm lint          # Verificar código (Biome)
pnpm format        # Formatar código (Biome)
pnpm typecheck     # Verificar tipos TypeScript
pnpm audit         # Checar vulnerabilidades
pnpm metrics       # Relatório CC/MI/Halstead + cobertura
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

## Componentes UI

Re-exports diretos de `@kaiserinc/react` em `src/components/ui/` com `"use client"` boundary. Todos usam CSS custom properties dark-first — sem hex hardcoded.

| Componente | Variantes / API |
|---|---|
| `Button` | default / outline / ghost / secondary / destructive · sizes: sm / md / lg |
| `Input` | label, description, error |
| `Label` | — |
| `Card` | Compound: `Card` + `CardHeader` + `CardTitle` + `CardDescription` + `CardContent` + `CardFooter` |
| `Badge` | **default** (gray) / **success** (green) / **warning** (yellow) / **danger** (red) / **brand** (purple) |
| `Alert` | default / destructive / success / warning · Compound: `Alert` + `AlertTitle` + `AlertDescription` |
| `Avatar` | `src`, `alt`, `fallback` (extrai iniciais do nome completo), `size`: xs / sm / md / lg / xl |
| `Separator` | horizontal / vertical |
| `Skeleton` | `animate-pulse` |
| `Toast` | via `toast()` do sonner — default / success / error / warning / info / loading |

Visualize todos em `/components`.

## Layout autenticado

O layout `(app)/` inclui:

- **Sidebar** — animação open/close via `grid-template-columns`. Logo KaiserInc com "Kaiser" em branco e "Inc" em roxo (`--brand`). Active state com `bg-[var(--brand-subtle)]`. Botão "Sair" fica vermelho no hover.
- **Topbar** — botão de toggle da sidebar + `UserMenu` (dropdown com Avatar, nome do usuário, link para Configurações e botão "Sair" em vermelho).
- **UserMenu** — Avatar `sm` com iniciais extraídas do username. Dropdown com animação `dropdown-in`. Fecha ao clicar fora.

## Arquitetura

```
src/
├── app/
│   ├── layout.tsx                   # Root layout + Providers + Roboto font
│   ├── page.tsx                     # Info / Landing page (pública)
│   ├── _info-topbar.tsx             # TopBar client wrapper para a info page
│   ├── globals.css                  # Tailwind v4 + tokens KaiserInc + CSS bridge + animações
│   ├── (public)/                    # Rotas públicas (sem sidebar)
│   │   ├── login/page.tsx           # Formulário NextAuth signIn
│   │   └── register/page.tsx        # Cadastro via /auth/register
│   ├── (app)/                       # Rotas autenticadas
│   │   ├── layout.tsx               # Sidebar + Topbar
│   │   ├── dashboard/page.tsx       # RSC com fetch autenticado + ícones Lucide
│   │   ├── settings/page.tsx        # Atualização de perfil
│   │   └── components/page.tsx      # Showcase do Design System
│   └── api/auth/[...nextauth]/      # Handler NextAuth
├── components/
│   ├── ui/                          # Re-exports @kaiserinc/react com "use client"
│   ├── layout/                      # Sidebar, Topbar, UserMenu, Providers, Footer
│   └── shared/                      # Logo, componentes reutilizáveis
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

## Design System

`@kaiserinc/react` usa CSS custom properties (dark-first). Tokens em `globals.css` via `@theme {}` (Tailwind v4):

| Token | Uso |
|---|---|
| `--brand` / `--brand-hover` / `--brand-subtle` | Botões primários, active state, badges |
| `--bg-base` / `--bg-surface` / `--bg-elevated` | Fundos em camadas (preto → cinza escuro) |
| `--fg-1` … `--fg-5` | Texto — do mais para o menos proeminente |
| `--border-default` / `--border-subtle` | Divisores e bordas |
| `--radius-sm` … `--radius-xl` / `--radius-pill` | Border radius semântico |
| `--danger-500` / `--success-500` / `--warning-500` | Estados semânticos |

Fontes: Roboto (300–900) + Roboto Mono via `next/font/google`.

## Segurança

Headers de segurança em `next.config.ts`:

| Header | Valor |
|---|---|
| `Content-Security-Policy` | `default-src 'self'` + origens autorizadas |
| `Strict-Transport-Security` | `max-age=31536000` (produção apenas) |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, mic, geolocation desabilitados |

Vulnerabilidades de dependências gerenciadas via `pnpm.overrides` em `package.json`.

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

Copie `.env.example` para `.env.local` e ajuste:

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
| Segurança | 0 vulnerabilidades (`pnpm audit`) |
