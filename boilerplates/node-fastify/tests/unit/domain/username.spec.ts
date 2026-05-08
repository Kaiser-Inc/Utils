import { describe, expect, it } from "vitest";
import { Username } from "../../../src/app/domain/value-objects/username.js";

describe("Username value object", () => {
  it("should create a valid username", () => {
    const username = Username.create("Pedro_Dev");
    expect(username.value).toBe("pedro_dev");
  });

  it("should throw when username is empty", () => {
    expect(() => Username.create("")).toThrow("Username cannot be empty");
  });

  it("should throw when username is too short", () => {
    expect(() => Username.create("ab")).toThrow("at least 3 characters");
  });

  it("should throw when username is too long", () => {
    expect(() => Username.create("a".repeat(51))).toThrow("at most 50 characters");
  });

  it("should throw when username has invalid characters", () => {
    expect(() => Username.create("pedro$kaiser")).toThrow(
      "letters, numbers, underscores and hyphens",
    );
  });

  it("should allow hyphens", () => {
    const username = Username.create("pedro-kaiser");
    expect(username.value).toBe("pedro-kaiser");
  });

  it("should consider equal usernames as equal", () => {
    const a = Username.create("Pedro");
    const b = Username.create("pedro");
    expect(a.equals(b)).toBe(true);
  });
});
