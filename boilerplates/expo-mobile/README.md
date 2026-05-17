# Expo Mobile Boilerplate

Aplicativo mobile React Native com autenticação JWT, Expo Router v4 e integração com qualquer backend KaiserInc.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo SDK 52 (managed workflow) |
| Router | Expo Router v4 (file-based) |
| Package manager | pnpm ≥ 9 |
| TypeScript | 5 strict |
| Auth | expo-secure-store + AuthContext |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 |
| Forms | React Hook Form + Zod |
| UI | KaiserInc Design System (NativeWind v4) |
| Lint / Format | Biome |
| Testes | Jest + React Native Testing Library |
| E2E | Maestro |

## Início rápido

```bash
cp .env.example .env
pnpm install
pnpm start
```

| Plataforma | Comando |
|---|---|
| iOS | `pnpm ios` ou pressione `i` no terminal |
| Android | `pnpm android` ou pressione `a` no terminal |
| Web | `pnpm exec expo start --web` |

> Requer backend KaiserInc rodando em `EXPO_PUBLIC_BACKEND_URL` (padrão: `http://localhost:3000`).  
> Em dispositivo físico, substitua `localhost` pelo IP da máquina.

## Comandos

```bash
pnpm start         # Expo dev server
pnpm ios           # Iniciar no iOS simulator
pnpm android       # Iniciar no Android emulator
pnpm test          # Testes unitários (Jest)
pnpm test:coverage # Testes com cobertura
pnpm e2e           # Testes E2E (Maestro)
pnpm lint          # Verificar código (Biome)
pnpm format        # Formatar código (Biome)
pnpm typecheck     # Verificar tipos TypeScript
pnpm audit         # Checar vulnerabilidades
pnpm metrics       # Relatório CC/MI/Halstead + cobertura
```

## Compatibilidade de backend

Integra com qualquer backend KaiserInc via `EXPO_PUBLIC_BACKEND_URL`:

```bash
# Com node-fastify
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000

# Com python-fastapi
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000

# Com ruby-on-rails
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
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

Biblioteca em `src/components/ui/` com Composition Pattern (NativeWind v4):

| Componente | Ação | Variantes / Props |
|---|---|---|
| `Button` | Pressable estilizado | default / outline / ghost / secondary / destructive + `leftIcon` / `rightIcon` |
| `Input` | TextInput composto | `label`, `description`, `error`, `leadingIcon`, `trailingIcon` |
| `Card` | Compound | `Card` + `CardHeader` + `CardContent` + `CardFooter` |
| `Badge` | View + Text | **default / brand / success / warning / danger** (variantes nativas DS) |
| `Avatar` | View + Image/Text | `name` (extrai iniciais), `src`, `size`: xs / sm / md / lg / xl |
| `Skeleton` | Animated opacity pulse | — |
| `ScreenHeader` | Cabeçalho de tela | `title`, `subtitle`, `rightSlot` |
| `Logo` | Image local | `size` (padrão 96) |

Todos os componentes re-exportam diretamente de `@kaiserinc/react-native` — sem mapeamento de variantes legadas.

Visualize todos na aba **Componentes** do app.

## Arquitetura

```
src/
├── app/                             # Expo Router file-based
│   ├── _layout.tsx                  # Root layout + Providers + Roboto font
│   ├── index.tsx                    # Guard → (auth)/login ou (tabs)/
│   ├── (auth)/                      # Rotas públicas (Logo + fade-up animation)
│   │   ├── login.tsx                # Tela de login
│   │   └── register.tsx             # Tela de cadastro
│   └── (tabs)/                      # Rotas autenticadas
│       ├── _layout.tsx              # Tab bar (Início, Configurações, Componentes)
│       ├── index.tsx                # Home / dashboard (ícones Lucide + fade-up)
│       ├── settings.tsx             # Configurações + Avatar header + logout
│       └── components.tsx           # Showcase do Design System
├── components/
│   ├── ui/                          # Button, Input, Card, Badge, Avatar, Skeleton
│   ├── layout/                      # Providers (QueryClient + AuthProvider + Roboto)
│   └── shared/                      # ScreenHeader, Logo
├── lib/
│   ├── auth/
│   │   ├── auth-context.tsx         # AuthProvider + useAuth hook
│   │   └── token-storage.ts         # expo-secure-store wrapper
│   ├── api/
│   │   ├── client.ts                # Fetch wrapper (mesma interface do next-saas)
│   │   └── endpoints/               # auth.ts, users.ts
│   └── utils.ts                     # cn(), formatDate(), truncate()
├── hooks/
│   └── use-user.ts                  # useUser() via AuthContext
└── stores/
    └── ui-store.ts                  # Zustand: tema
```

## Design System

Paleta KaiserInc definida em `tailwind.config.js` via tokens NativeWind:

| Token | Uso |
|---|---|
| `brand` (`#8257E6`) | Botões, tab ativo, foco |
| `bg-base` (`#09090a`) | Fundo principal das telas |
| `bg-surface` (`#121214`) | Cards, inputs |
| `bg-elevated` (`#202024`) | Modais, tooltips |
| `fg-1` | Texto primário |
| `fg-3` / `muted-foreground` | Texto secundário |
| `border-default` / `border` | Divisores, bordas |
| `success` / `warning` / `danger` | Feedback de status |

Fontes: Roboto (300–900) carregadas via `@expo-google-fonts/roboto` + `useFonts()`.

Badge variantes nativas: `default` · `brand` · `success` · `warning` · `danger`

Avatar: prop `name` extrai iniciais automaticamente · `src` para imagem · `size`: xs / sm / md / lg / xl

## Auth Flow

```
Login screen
  → POST EXPO_PUBLIC_BACKEND_URL/auth/session → { access_token }
  → SecureStore.setItemAsync("access_token", token)
  → GET  EXPO_PUBLIC_BACKEND_URL/users/me     → { user }
  → AuthContext.setUser(user) → navega para (tabs)/

app/index.tsx:
  → Lê token do SecureStore no boot
  → sem token → (auth)/login
  → com token válido → (tabs)/

API calls:
  → apiClient(path, { token: accessToken })
  → Authorization: Bearer <token>
```

## Variáveis de ambiente

Copie `.env.example` e ajuste:

```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
```

## Qualidade

| Métrica | Target |
|---------|--------|
| CC avg | ≤ 5 (grau A) |
| MI avg | ≥ 75 |
| Cobertura | ≥ 80% |
| Lint | 0 erros (Biome) |
| Segurança | 0 critical |
