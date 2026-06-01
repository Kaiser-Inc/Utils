.PHONY: setup dev test lint format migrate rollback console routes docs build up down load-test audit seed metrics

setup:
	bundle install
	bin/rails db:create db:migrate db:seed

dev:
	bin/rails server -b 0.0.0.0

test:
	bundle exec rspec

lint:
	bundle exec rubocop

format:
	bundle exec rubocop -A

migrate:
	bin/rails db:migrate

rollback:
	bin/rails db:rollback

console:
	bin/rails console

routes:
	bin/rails routes

# Gera swagger/v1/swagger.yaml a partir dos request specs rswag
# Acesse a UI em http://localhost:3000/api-docs após subir o servidor
docs:
	bundle exec rails rswag:specs:swaggerize

build:
	docker compose build

up:
	docker compose up

down:
	docker compose down

load-test:
	docker compose -f load-tests/docker-compose.loadtest.yml run --rm k6 run /scripts/auth.js

audit:
	bundle exec bundle-audit check --update

seed:
	bin/rails db:seed

# Sobe o Postgres, prepara o schema de teste e roda a suíte ANTES das métricas.
# O DATABASE_URL aponta para localhost (porta publicada pelo compose) porque o
# host "db" só resolve dentro da rede Docker — rodar rspec fora do container sem
# isso faz todos os specs abortarem e o SimpleCov reportar 0% de cobertura.
METRICS_DATABASE_URL ?= postgresql://postgres:postgres@localhost:5432/boilerplate_test
metrics:
	@docker compose up -d --wait db
	@trap 'docker compose rm -sf db' EXIT; \
		RAILS_ENV=test DATABASE_URL=$(METRICS_DATABASE_URL) bundle exec rails db:prepare && \
		{ RAILS_ENV=test DATABASE_URL=$(METRICS_DATABASE_URL) bundle exec rspec --no-color -f progress || true; } && \
		bundle exec ruby scripts/metrics.rb
