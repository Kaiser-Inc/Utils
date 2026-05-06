# KaiserInc Utils

Repositório central de ferramentas, boilerplates e arquivos utilitários usados nos projetos da KaiserInc. A ideia é consolidar num único lugar os padrões arquiteturais, configurações e pontos de partida já validados — eliminando o custo de setup repetitivo a cada novo projeto.

---

## O que tem aqui

### `boilerplates/`

Três boilerplates de API prontos para uso, com os mesmos endpoints, padrões de autenticação e convenções arquiteturais — cada um adaptado idiomaticamente para sua stack.

| Stack | Diretório | Framework | README |
|---|---|---|---|
| Python | `boilerplates/python-fastapi/` | FastAPI + SQLAlchemy + Alembic | [README](boilerplates/python-fastapi/README.md) |
| Node.js | `boilerplates/node-fastify/` | Fastify 5 + Drizzle ORM + TypeScript | [README](boilerplates/node-fastify/README.md) |
| Ruby | `boilerplates/ruby-on-rails/` | Rails 8.1 API-only | [README](boilerplates/ruby-on-rails/README.md) |

Todos implementam:
- **Autenticação dual-token** — access JWT (15min) + refresh token em HTTP-only cookie (7d)
- **Ambiente Docker** com multi-stage build, usuário não-root e PostgreSQL
- **Testes** com cobertura de endpoints e lógica de negócio
- **Documentação OpenAPI** com Scalar UI em `/docs` (Python/Node) ou `/scalar` (Rails)
- **Telemetria** com OpenTelemetry + Jaeger
- **Linting** configurado (ruff / Biome / RuboCop)

Veja [`boilerplates/README.md`](boilerplates/README.md) para a visão geral comparativa e comandos de início rápido, ou acesse o README de cada boilerplate diretamente.

---

## Como usar

### Novo projeto a partir de um boilerplate

```bash
# Copie o boilerplate para o destino do novo projeto
cp -r boilerplates/python-fastapi/ ~/KaiserInc/novo-projeto

# Entre no projeto, configure o ambiente e suba
cd ~/KaiserInc/novo-projeto
cp .env.example .env
# edite .env com as credenciais reais
docker compose up
```

### Como skill no Claude Code

Este repositório pode ser referenciado diretamente como contexto ao iniciar uma sessão do Claude Code em qualquer projeto KaiserInc:

```
Utilize o boilerplate em KaiserInc-Utils/boilerplates/python-fastapi como base
arquitetural para implementar o módulo X neste projeto.
```

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
├── boilerplates/
│   ├── python-fastapi/     # Clean Architecture + DDD (FastAPI)
│   ├── node-fastify/       # Clean Architecture (Fastify + TypeScript)
│   └── ruby-on-rails/      # Organizers + Interactors (Rails API)
└── README.md               # este arquivo
```

---

## Contribuindo

Ao adicionar um novo boilerplate ou ferramenta:

1. Crie um diretório com nome descritivo da stack/propósito
2. Inclua um `README.md` com stack, arquitetura, comandos e endpoints
3. Garanta que `docker compose up` funcione do zero com `.env.example`
4. Atualize este README com a entrada na tabela de conteúdo
