.PHONY: dev test lint format migrate load-test audit seed metrics metrics-install

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

audit:
	pip-audit -r requirements.txt

seed:
	python scripts/seed.py

metrics-install:
	pip install -r requirements-metrics.txt

metrics:
	python scripts/metrics.py
