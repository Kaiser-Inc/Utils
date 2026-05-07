.PHONY: dev test lint format migrate load-test

dev:
	uvicorn main:app --reload --app-dir src

test:
	pytest --cov=src --cov-report=term-missing

lint:
	ruff check src tests

format:
	ruff format src tests

migrate:
	alembic upgrade head

load-test:
	docker compose -f load-tests/docker-compose.loadtest.yml up --build
