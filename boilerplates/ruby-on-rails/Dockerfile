# ── Stage 1: base ─────────────────────────────────────────────────────────────
# Imagem mínima de runtime — base para os demais estágios
ARG RUBY_VERSION=3.3.6
FROM ruby:${RUBY_VERSION}-slim AS base

WORKDIR /rails

# Apenas deps de runtime (sem compiladores)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      curl \
      libpq5 \
      postgresql-client && \
    rm -rf /var/lib/apt/lists/*

ENV RAILS_ENV=production \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_WITHOUT="development test" \
    BUNDLE_DEPLOYMENT=1

# ── Stage 2: gems ─────────────────────────────────────────────────────────────
# Instala todas as gems (requer build tools) — não vai para produção
FROM base AS gems

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential \
      git \
      libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY Gemfile Gemfile.lock ./
RUN bundle install \
    && rm -rf "${BUNDLE_PATH}/ruby/*/cache" \
              "${BUNDLE_PATH}/ruby/*/bundler/gems/*/.git"

# ── Stage 3: app ──────────────────────────────────────────────────────────────
# Copia o código e pré-compila bootsnap — ainda usa gems do estágio anterior
FROM gems AS app

COPY . .

# Pré-compila bootsnap para reduzir tempo de boot
RUN bundle exec bootsnap precompile app/ lib/

# ── Stage 4: runtime ──────────────────────────────────────────────────────────
# Imagem final: gems + código pré-compilado, sem build tools
FROM base AS runtime

COPY --from=gems /usr/local/bundle /usr/local/bundle
COPY --from=app  /rails             /rails

# Usuário não-root para segurança
RUN useradd --create-home --shell /bin/bash rails \
    && mkdir -p db log storage tmp \
    && chown -R rails:rails db log storage tmp
USER rails

ENTRYPOINT ["/rails/bin/docker-entrypoint"]

EXPOSE 3000
CMD ["./bin/rails", "server", "-b", "0.0.0.0"]
