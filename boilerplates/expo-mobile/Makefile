.PHONY: start android ios test test-coverage lint format typecheck audit metrics e2e

start:
	npx expo start

android:
	npx expo start --android

ios:
	npx expo start --ios

test:
	npx jest

test-coverage:
	npx jest --coverage

lint:
	npx biome check src/

format:
	npx biome format --write src/

typecheck:
	npx tsc --noEmit

audit:
	npm audit --audit-level=critical

metrics:
	npx jest --coverage --coverageReporters=json 2>/dev/null; npx tsx scripts/metrics.ts

e2e:
	maestro test tests/e2e/flows/
