.PHONY: dev build start test test-coverage e2e lint format typecheck audit metrics

dev:
	pnpm dev

build:
	pnpm build

start:
	pnpm start

test:
	pnpm test

test-coverage:
	pnpm test:coverage

e2e:
	pnpm e2e

lint:
	pnpm lint

format:
	pnpm format

typecheck:
	pnpm typecheck

audit:
	pnpm audit --audit-level=high

metrics:
	pnpm test:coverage && pnpm metrics
