<p align="center">
  <img src="./assets/logo.png" alt="KaiserInc" width="160" />
</p>

# KaiserInc Utils

Repositório central de ferramentas, boilerplates e arquivos utilitários usados nos projetos da KaiserInc. A ideia é consolidar num único lugar os padrões arquiteturais, configurações e pontos de partida já validados — eliminando o custo de setup repetitivo a cada novo projeto. Inclui três boilerplates de API e dois boilerplates frontend.

---

## O que tem aqui

### `boilerplates/`

Três boilerplates de API e dois boilerplates frontend prontos para uso, com os mesmos endpoints, padrões de autenticação e convenções arquiteturais — cada um adaptado idiomaticamente para sua stack.

| Stack | Diretório | Framework | URL | README |
|---|---|---|---|---|
| Python | `boilerplates/python-fastapi/` | FastAPI + SQLAlchemy | `http://localhost:8000` | [README](boilerplates/python-fastapi/README.md) |
| Node.js | `boilerplates/node-fastify/` | Fastify 5 + Drizzle | `http://localhost:3000` | [README](boilerplates/node-fastify/README.md) |
| Ruby | `boilerplates/ruby-on-rails/` | Rails 8.1 API-only | `http://localhost:3000` | [README](boilerplates/ruby-on-rails/README.md) |
| Next.js | `boilerplates/next-saas/` | Next.js 15 App Router | `http://localhost:4000` | [README](boilerplates/next-saas/README.md) |
| Expo | `boilerplates/expo-mobile/` | Expo SDK 52 + Expo Router v4 | iOS / Android | [README](boilerplates/expo-mobile/README.md) |

Todos implementam:
- **Autenticação dual-token** — access JWT (15min) + refresh token em HTTP-only cookie (7d)
- **Ambiente Docker** com multi-stage build, usuário não-root e PostgreSQL
- **Testes** com cobertura de endpoints e lógica de negócio
- **Documentação OpenAPI** com Scalar UI em `/docs` (Python/Node) ou `/scalar` + Swagger UI em `/api-docs` (Rails)
- **Telemetria** com OpenTelemetry + Jaeger
- **Linting** configurado (ruff / Biome / RuboCop)
- **Load testing** tooling (Locust para Python, k6 para Node/Rails)

Frontend boilerplates (`next-saas` e `expo-mobile`) implementam:
- **Autenticação** via JWT do backend — agnósticos de stack (funciona com qualquer dos 3 backends)
- **Mesmas métricas de qualidade** — CC/MI/Halstead via `scripts/metrics.ts`, lint, cobertura, audit
- **Testes** unitários e E2E (Playwright para web, Maestro para mobile)

---

## Como usar

### Novo projeto a partir de um boilerplate

**Python (FastAPI):**
```bash
cp -r boilerplates/python-fastapi/ ~/KaiserInc/novo-projeto
cd ~/KaiserInc/novo-projeto
cp .env.example .env
docker compose up
# API em http://localhost:8000 | Docs em http://localhost:8000/docs
```

**Node.js (Fastify):**
```bash
cp -r boilerplates/node-fastify/ ~/KaiserInc/novo-projeto
cd ~/KaiserInc/novo-projeto
cp .env.example .env
docker compose up
# API em http://localhost:3000 | Docs em http://localhost:3000/docs
```

**Ruby on Rails:**
```bash
cp -r boilerplates/ruby-on-rails/ ~/KaiserInc/novo-projeto
cd ~/KaiserInc/novo-projeto
cp .env.example .env
docker compose up
# API em http://localhost:3000 | Docs em http://localhost:3000/scalar ou /api-docs
```

**Next.js (SaaS):**
```bash
cp -r boilerplates/next-saas/ ~/KaiserInc/novo-projeto
cd ~/KaiserInc/novo-projeto
cp .env.example .env
npm install
npm run dev
# App em http://localhost:4000 | Requer backend em BACKEND_URL
```

**Expo (Mobile):**
```bash
cp -r boilerplates/expo-mobile/ ~/KaiserInc/novo-projeto
cd ~/KaiserInc/novo-projeto
cp .env.example .env
npm install --legacy-peer-deps
npx expo start
# iOS: pressione i | Android: pressione a
```

### Como usar com Claude Code

Este repositório integra com a skill `/KaiserInc-newProject` do Claude Code, que automatiza a criação de novos projetos a partir dos boilerplates.

A skill suporta três modos:

- **lean** — copia o boilerplate e ajusta configurações básicas (nome, banco, portas)
- **full** — lean + scaffolding do primeiro domínio de negócio (entidade, repositório, service, rota)
- **fullstack-monorepo** — full + frontend React/Next.js integrado no mesmo repositório

```
# Exemplo de uso no Claude Code
/KaiserInc-newProject
```

O Claude irá perguntar qual stack (python / node / rails), qual modo (lean / full / fullstack-monorepo) e o nome do projeto — e configurará tudo automaticamente.

---

## Princípios

**Consistência entre stacks.** Os boilerplates seguem os mesmos contratos de API, mesma estratégia de autenticação e mesma estrutura de endpoints — independente da linguagem. Mudar de stack não muda o contrato.

**Ambiente limpo.** Cada boilerplate tem o mínimo necessário para escalar. Sem dependências desnecessárias, sem código de negócio específico, sem configurações que só fazem sentido para um projeto.

**Prontos para produção.** Multi-stage Docker, usuário não-root, variáveis de ambiente documentadas, migrations automáticas no boot, telemetria integrada.

**Extensíveis.** A estrutura de cada boilerplate foi desenhada para crescer sem refatoração: basta adicionar novos domínios seguindo os padrões já estabelecidos.

---

## Estrutura do repositório

```
KaiserInc-Utils/
├── .github/workflows/ci.yml   # CI: lint + test + audit para cada boilerplate
├── boilerplates/
│   ├── python-fastapi/         # Clean Architecture + DDD (FastAPI)
│   ├── node-fastify/           # Clean Architecture (Fastify + TypeScript)
│   ├── ruby-on-rails/          # Organizers + Interactors (Rails API)
│   ├── next-saas/              # Next.js 15 App Router — SaaS autenticado
│   └── expo-mobile/            # Expo SDK 52 + Expo Router v4 — Mobile autenticado
├── docs/adr/                   # Architecture Decision Records
├── CONTRIBUTING.md             # Convenções de commit + spec de erros + checklist
├── renovate.json               # Atualização automática de dependências
└── README.md                   # este arquivo
```

---

## Contribuindo

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para:
- Convenção de commits (Conventional Commits)
- Spec unificada de resposta de erro
- Checklist completo de features por boilerplate
- Guia para adicionar um novo stack

### Comandos úteis por boilerplate

```bash
make audit    # escaneia CVEs em dependências
make lint     # verifica style/type errors
make test     # roda suite completa de testes
make load-test # executa k6 / Locust
```
