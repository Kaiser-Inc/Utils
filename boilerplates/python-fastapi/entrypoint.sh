#!/bin/sh
set -e

HOST="db"
PORT="5432"
USER="docker"

echo "Waiting for postgres..."

while ! pg_isready -h $HOST -p $PORT -U $USER; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo "Postgres is up - executing command"

alembic upgrade head
exec uvicorn main:app --host 0.0.0.0 --port 8000
