.PHONY: start android ios test test-coverage lint format typecheck audit metrics e2e

start:
	pnpm exec expo start

android:
	pnpm exec expo start --android

ios:
	pnpm exec expo start --ios

test:
	pnpm test

test-coverage:
	pnpm test:coverage

lint:
	pnpm exec biome check src/

format:
	pnpm exec biome format --write src/

typecheck:
	pnpm exec tsc --noEmit

audit:
	pnpm audit --audit-level=critical

metrics:
	pnpm exec jest --coverage --coverageReporters=json 2>/dev/null; pnpm exec tsx scripts/metrics.ts

e2e:
	maestro test tests/e2e/flows/
