import { describe, expect, it } from "vitest";
import { Role } from "../../../src/app/domain/role.js";
import { User } from "../../../src/app/domain/user.js";
import { Email } from "../../../src/app/domain/value-objects/email.js";
import { Username } from "../../../src/app/domain/value-objects/username.js";

describe("User domain entity", () => {
  const baseProps = {
    id: "user-123",
    username: "pedro",
    email: "pedro@example.com",
    hashedPassword: "hashed",
    role: Role.USER,
    createdAt: new Date("2024-01-01"),
  };

  describe("User.reconstitute()", () => {
    it("should reconstitute a user with USER role", () => {
      const user = User.reconstitute({ ...baseProps, role: "user" });
      expect(user.id).toBe("user-123");
      expect(user.username).toBe("pedro");
      expect(user.email).toBe("pedro@example.com");
      expect(user.role).toBe(Role.USER);
      expect(user.createdAt).toEqual(new Date("2024-01-01"));
    });

    it("should reconstitute a user with ADMIN role", () => {
      const user = User.reconstitute({ ...baseProps, role: "admin" });
      expect(user.role).toBe(Role.ADMIN);
    });

    it("should default to USER role for unknown role strings", () => {
      const user = User.reconstitute({ ...baseProps, role: "unknown" });
      expect(user.role).toBe(Role.USER);
    });
  });

  describe("role management", () => {
    it("promoteToAdmin() should change role to ADMIN", () => {
      const user = User.create(baseProps);
      expect(user.isAdmin()).toBe(false);
      user.promoteToAdmin();
      expect(user.role).toBe(Role.ADMIN);
      expect(user.isAdmin()).toBe(true);
    });

    it("demoteToUser() should change role back to USER", () => {
      const user = User.create({ ...baseProps, role: Role.ADMIN });
      expect(user.isAdmin()).toBe(true);
      user.demoteToUser();
      expect(user.role).toBe(Role.USER);
      expect(user.isAdmin()).toBe(false);
    });
  });

  describe("changeEmail()", () => {
    it("should update the email", () => {
      const user = User.create(baseProps);
      const newEmail = Email.create("new@example.com");
      user.changeEmail(newEmail);
      expect(user.email).toBe("new@example.com");
    });
  });

  describe("changeUsername()", () => {
    it("should update the username", () => {
      const user = User.create(baseProps);
      const newUsername = Username.create("newpedro");
      user.changeUsername(newUsername);
      expect(user.username).toBe("newpedro");
    });
  });

  describe("toJSON()", () => {
    it("should return a plain object without hashedPassword", () => {
      const user = User.create(baseProps);
      const json = user.toJSON();
      expect(json).toEqual({
        id: "user-123",
        username: "pedro",
        email: "pedro@example.com",
        role: Role.USER,
        createdAt: baseProps.createdAt,
      });
      expect("hashedPassword" in json).toBe(false);
    });
  });
});
