# ── Stage 1: base ─────────────────────────────────────────────────────────────
# Imagem mínima comum a todos os estágios
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/src \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Apenas libs de runtime (sem gcc, build-essential)
RUN apt-get update && apt-get install --no-install-recommends -y \
      libpq5 \
      postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# ── Stage 2: builder ──────────────────────────────────────────────────────────
# Compila wheels de todas as dependências — não vai para produção
FROM base AS builder

RUN apt-get update && apt-get install --no-install-recommends -y \
      build-essential \
      libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Compila e armazena as wheels em /wheels (sem acesso à internet na etapa final)
# --no-deps omitido propositalmente: inclui dependências transitivas nas wheels
RUN pip install --upgrade pip \
    && pip wheel --wheel-dir /wheels -r requirements.txt

# ── Stage 3: runtime ──────────────────────────────────────────────────────────
# Imagem final: copia apenas as wheels pré-compiladas, sem build tools
FROM base AS runtime

COPY --from=builder /wheels /wheels
RUN pip install --no-index --find-links=/wheels /wheels/* \
    && rm -rf /wheels

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
