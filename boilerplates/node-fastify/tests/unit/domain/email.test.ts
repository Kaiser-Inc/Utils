import { describe, expect, it } from "vitest";
import { Email } from "../../../src/app/domain/value-objects/email.js";

describe("Email value object", () => {
  it("should create a valid email", () => {
    const email = Email.create("User@Example.COM");
    expect(email.value).toBe("user@example.com");
  });

  it("should throw when email is empty", () => {
    expect(() => Email.create("")).toThrow("Email cannot be empty");
  });

  it("should throw when email has invalid format", () => {
    expect(() => Email.create("not-an-email")).toThrow("Invalid email format");
  });

  it("should trim whitespace", () => {
    const email = Email.create("  pedro@example.com  ");
    expect(email.value).toBe("pedro@example.com");
  });

  it("should consider equal emails as equal", () => {
    const a = Email.create("pedro@example.com");
    const b = Email.create("PEDRO@EXAMPLE.COM");
    expect(a.equals(b)).toBe(true);
  });
});
