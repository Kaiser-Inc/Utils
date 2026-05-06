.PHONY: setup dev test lint format migrate rollback console routes docs build up down

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
