"""
Seed script — populates the database with development data.
Run: python scripts/seed.py
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.core.security import hash_password
from app.repositories.sql_alchemy.models import UserModel  # adjust if model path differs


SEED_USERS = [
    {"username": "admin", "email": "admin@example.com", "password": "password123", "role": "admin"},
    {"username": "alice", "email": "alice@example.com", "password": "password123", "role": "user"},
    {"username": "bob", "email": "bob@example.com", "password": "password123", "role": "user"},
]


def seed(session: Session) -> None:
    print("Seeding database...")

    # Clean existing users (dev only)
    session.query(UserModel).delete()
    session.commit()

    for u in SEED_USERS:
        user = UserModel(
            username=u["username"],
            email=u["email"],
            hashed_password=hash_password(u["password"]),
            role=u["role"],
        )
        session.add(user)
        print(f"  Created: {u['email']} / {u['password']} (role: {u['role']})")

    session.commit()
    print("Done.")


if __name__ == "__main__":
    with SessionLocal() as session:
        seed(session)
