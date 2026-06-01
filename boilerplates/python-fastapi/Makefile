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

# Usa o interpretador do venv para que pylint/radon/pytest enxerguem as deps do
# projeto. Rodar com o python do sistema faz o pylint reportar dezenas de
# E0401 (unable-to-import) e derruba o score artificialmente.
VENV ?= .venv
PY := $(VENV)/bin/python

metrics-install:
	$(PY) -m pip install -r scripts/requirements-metrics.txt

metrics:
	$(PY) -m pytest --cov=src --cov-report=json
	$(PY) scripts/metrics.py
