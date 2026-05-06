export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EmailAlreadyInUseError extends DomainError {
  constructor() {
    super("Email is already in use");
  }
}

export class UsernameAlreadyTakenError extends DomainError {
  constructor() {
    super("Username is already taken");
  }
}

export class UserNotFoundError extends DomainError {
  constructor() {
    super("User not found");
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super("Invalid credentials");
  }
}

export class InvalidRefreshTokenError extends DomainError {
  constructor() {
    super("Invalid or expired refresh token");
  }
}

export class UnauthorizedError extends DomainError {
  constructor() {
    super("Unauthorized");
  }
}
