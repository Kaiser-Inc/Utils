import bcrypt


def hash_password(password: str) -> str:
    if not password or not password.strip():
        raise ValueError("Password cannot be empty")
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())
