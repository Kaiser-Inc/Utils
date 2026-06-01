.PHONY: dev test lint format generate migrate load-test audit seed metrics

dev:
	pnpm dev

test:
	pnpm test

lint:
	pnpm lint

format:
	pnpm format

generate:
	pnpm db:generate

migrate:
	pnpm db:migrate

load-test:
	docker compose -f load-tests/docker-compose.loadtest.yml run --rm k6 run /scripts/auth.js

audit:
	pnpm audit --audit-level=high

seed:
	pnpm exec tsx scripts/seed.ts

metrics:
	pnpm test:coverage && pnpm metrics
