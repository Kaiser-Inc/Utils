#!/bin/sh
set -e

HOST="${DB_HOST:-db}"
PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"

echo "Waiting for postgres..."

while ! pg_isready -h "$HOST" -p "$PORT" -U "$DB_USER"; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo "Postgres is up - executing command"

alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
