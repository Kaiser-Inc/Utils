# ── Stage 1: base ─────────────────────────────────────────────────────────────
FROM node:24-alpine AS base

RUN corepack enable

ENV NODE_ENV=production

WORKDIR /app

# ── Stage 2: deps ─────────────────────────────────────────────────────────────
# Instala TODAS as deps (incluindo devDependencies necessárias para build)
# NODE_ENV sobrescrito: NODE_ENV=production pularia devDeps (tsc, tsx, etc.)
FROM base AS deps

ENV NODE_ENV=development

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── Stage 3: builder ──────────────────────────────────────────────────────────
# Compila o TypeScript — este estágio não vai para produção
FROM deps AS builder

COPY tsconfig.json ./
COPY src ./src

RUN pnpm run build

# ── Stage 4: prod-deps ────────────────────────────────────────────────────────
# Instala apenas dependências de produção (sem devDependencies)
FROM base AS prod-deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ── Stage 5: runtime ──────────────────────────────────────────────────────────
# Imagem final: dist compilado + deps de produção + migrations
FROM base AS runtime

# Usuário não-root
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nodeuser

COPY --from=prod-deps --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --from=builder   --chown=nodeuser:nodejs /app/dist         ./dist
COPY --chown=nodeuser:nodejs package.json ./
COPY --chown=nodeuser:nodejs drizzle/migrations ./drizzle/migrations

USER nodeuser

EXPOSE 3000

CMD ["node", "dist/main.js"]
