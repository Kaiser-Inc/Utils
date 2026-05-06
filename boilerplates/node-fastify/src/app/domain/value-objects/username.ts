const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 50;

export class Username {
  private constructor(public readonly value: string) {}

  static create(raw: string): Username {
    if (!raw || raw.trim() === "") {
      throw new Error("Username cannot be empty");
    }
    const trimmed = raw.trim();
    if (trimmed.length < MIN_LENGTH) {
      throw new Error(`Username must be at least ${MIN_LENGTH} characters`);
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new Error(`Username must be at most ${MAX_LENGTH} characters`);
    }
    if (!USERNAME_REGEX.test(trimmed)) {
      throw new Error("Username can only contain letters, numbers, underscores and hyphens");
    }
    return new Username(trimmed.toLowerCase());
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
