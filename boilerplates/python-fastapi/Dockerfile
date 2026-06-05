# ── Stage 1: base ─────────────────────────────────────────────────────────────
# Imagem mínima comum a todos os estágios
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/src

WORKDIR /app

# Apenas libs de runtime (sem gcc, build-essential)
RUN apt-get update && apt-get install --no-install-recommends -y \
      libpq5 \
      postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# ── Stage 2: builder ──────────────────────────────────────────────────────────
# Resolve e instala as dependências em /app/.venv via uv — não vai para produção
FROM base AS builder

# Binário uv pinado (imagem oficial Astral)
COPY --from=ghcr.io/astral-sh/uv:0.11 /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=0

RUN apt-get update && apt-get install --no-install-recommends -y \
      build-essential \
      libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Camada cacheável: só os manifestos. Instala apenas runtime (--no-dev).
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# ── Stage 3: runtime ──────────────────────────────────────────────────────────
# Imagem final: copia apenas o virtualenv pronto, sem uv nem build tools
FROM base AS runtime

COPY --from=builder /app/.venv /app/.venv

# Faz alembic/uvicorn do venv resolverem sem precisar de `uv run`
ENV PATH="/app/.venv/bin:$PATH"

# Usuário não-root para segurança
RUN useradd --create-home --shell /bin/bash appuser
USER appuser

COPY --chown=appuser:appuser src ./src
COPY --chown=appuser:appuser alembic ./alembic
COPY --chown=appuser:appuser alembic.ini .
COPY --chown=appuser:appuser entrypoint.sh .

RUN chmod +x entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
