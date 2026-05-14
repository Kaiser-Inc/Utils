.PHONY: dev test lint format migrate load-test audit seed metrics

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

audit:
	npm audit --audit-level=high

seed:
	npx tsx scripts/seed.ts

metrics:
	npm run test:coverage && npm run metrics
