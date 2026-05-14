# Expo Mobile Boilerplate

Aplicativo mobile React Native com autenticação JWT, Expo Router v4 e integração com qualquer backend KaiserInc.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo SDK 52 (managed workflow) |
| Router | Expo Router v4 (file-based) |
| TypeScript | 5 strict |
| Auth | expo-secure-store + AuthContext |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 |
| Forms | React Hook Form + Zod |
| UI | NativeWind v4 (Tailwind CSS para React Native) |
| Lint / Format | Biome |
| Testes | Jest + React Native Testing Library |
| E2E | Maestro |

## Início rápido

```bash
cp .env.example .env
npm install --legacy-peer-deps
npx expo start
```

| Plataforma | Comando |
|---|---|
| iOS | `make ios` ou pressione `i` no terminal |
| Android | `make android` ou pressione `a` no terminal |
| Web | `npx expo start --web` |

> Requer backend KaiserInc rodando em `EXPO_PUBLIC_BACKEND_URL` (padrão: `http://localhost:3000`).

## Comandos

```bash
make start        # Expo dev server
make ios          # Iniciar no iOS simulator
make android      # Iniciar no Android emulator
make test         # Testes unitários (Jest)
make test-coverage # Testes com cobertura
make e2e          # Testes E2E (Maestro)
make lint         # Verificar código (Biome)
make format       # Formatar código (Biome)
make typecheck    # Verificar tipos TypeScript
make audit        # Checar vulnerabilidades
make metrics      # Relatório CC/MI/Halstead + cobertura
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

## Arquitetura

```
src/
├── app/                             # Expo Router file-based
│   ├── _layout.tsx                  # Root layout + Providers
│   ├── index.tsx                    # Guard → (auth)/login ou (tabs)/
│   ├── (auth)/                      # Rotas públicas
│   │   ├── login.tsx                # Tela de login
│   │   └── register.tsx             # Tela de cadastro
│   └── (tabs)/                      # Rotas autenticadas
│       ├── _layout.tsx              # Tab bar
│       ├── index.tsx                # Home / dashboard
│       └── settings.tsx             # Configurações + logout
├── components/
│   ├── ui/                          # Button, Input, Card (NativeWind)
│   ├── layout/                      # Providers (QueryClient + AuthProvider)
│   └── shared/                      # ScreenHeader
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
