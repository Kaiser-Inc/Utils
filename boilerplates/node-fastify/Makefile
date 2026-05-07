.PHONY: dev test lint format migrate load-test

dev:
	npm run dev

test:
	npm run test

lint:
	npm run lint

format:
	npm run format

migrate:
	npm run db:migrate

load-test:
	docker compose -f load-tests/docker-compose.loadtest.yml run --rm k6 run /scripts/auth.js
