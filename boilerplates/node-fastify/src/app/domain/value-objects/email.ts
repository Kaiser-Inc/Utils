const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    if (!raw || raw.trim() === "") {
      throw new Error("Email cannot be empty");
    }
    const normalized = raw.toLowerCase().trim();
    if (!EMAIL_REGEX.test(normalized)) {
      throw new Error("Invalid email format");
    }
    return new Email(normalized);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
