.PHONY: dev test lint format migrate

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
