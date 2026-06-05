.PHONY: install dev test lint format migrate load-test audit seed metrics

install:
	uv sync

dev:
	uv run uvicorn main:app --reload --app-dir src

test:
	uv run pytest --cov=src --cov-report=term-missing

lint:
	uv run ruff check src tests

format:
	uv run ruff format src tests

migrate:
	uv run alembic upgrade head

load-test:
	docker compose -f load-tests/docker-compose.loadtest.yml up --build

audit:
	uv run pip-audit

seed:
	uv run python scripts/seed.py

metrics:
	uv sync --group metrics
	uv run --group metrics pytest --cov=src --cov-report=json
	uv run --group metrics python scripts/metrics.py
