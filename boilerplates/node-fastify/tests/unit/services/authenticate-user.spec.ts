import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { hashPassword } from "../../../src/app/core/security.js";
import { InvalidCredentialsError } from "../../../src/app/domain/errors.js";
import { User } from "../../../src/app/domain/user.js";
import type { InMemoryRefreshTokenRepository } from "../../../src/app/repositories/in-memory/in-memory-refresh-token-repository.js";
import type { InMemoryUserRepository } from "../../../src/app/repositories/in-memory/in-memory-user-repository.js";
import { AuthenticateUserService } from "../../../src/app/services/authenticate-user.js";
import type { TestContext } from "../../helpers/create-test-server.js";
import { createTestServer } from "../../helpers/create-test-server.js";

describe("AuthenticateUserService", () => {
  let ctx: TestContext;
  let userRepo: InMemoryUserRepository;
  let refreshTokenRepo: InMemoryRefreshTokenRepository;
  let service: AuthenticateUserService;

  beforeEach(async () => {
    // Need FastifyInstance for JWT signing — reuse the test server helper
    ctx = await createTestServer();
    userRepo = ctx.userRepo;
    refreshTokenRepo = ctx.refreshTokenRepo;
    service = new AuthenticateUserService(userRepo, refreshTokenRepo, ctx.app);
  });

  afterEach(async () => {
    await ctx.app.close();
  });

  async function seedUser(
    email = "pedro@example.com",
    password = "password123",
    username = "pedro",
  ) {
    const hashedPassword = await hashPassword(password);
    const user = User.create({
      id: crypto.randomUUID(),
      username,
      email: email.toLowerCase(),
      hashedPassword,
    });
    await userRepo.save(user);
    return user;
  }

  it("should return access token and refresh token on valid credentials", async () => {
    await seedUser();

    const result = await service.execute({
      email: "pedro@example.com",
      password: "password123",
    });

    expect(result.accessToken).toBeDefined();
    expect(result.rawRefreshToken).toBeDefined();
    expect(result.tokenType).toBe("bearer");
  });

  it("should normalize email to lowercase before lookup", async () => {
    await seedUser("pedro@example.com");

    // Should not throw even when email is uppercased
    const result = await service.execute({
      email: "PEDRO@EXAMPLE.COM",
      password: "password123",
    });

    expect(result.accessToken).toBeDefined();
  });

  it("should throw InvalidCredentialsError when user does not exist", async () => {
    await expect(
      service.execute({ email: "ghost@example.com", password: "password123" }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("should throw InvalidCredentialsError when password is wrong", async () => {
    await seedUser();

    await expect(
      service.execute({ email: "pedro@example.com", password: "wrongpassword" }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("should save a refresh token to the repository on success", async () => {
    await seedUser();

    await service.execute({ email: "pedro@example.com", password: "password123" });

    expect(refreshTokenRepo.items).toHaveLength(1);
    expect(refreshTokenRepo.items[0].tokenHash).toBeDefined();
    expect(refreshTokenRepo.items[0].expiresAt).toBeInstanceOf(Date);
  });

  it("should produce a different refresh token on each successful login", async () => {
    await seedUser();

    const first = await service.execute({ email: "pedro@example.com", password: "password123" });
    const second = await service.execute({ email: "pedro@example.com", password: "password123" });

    expect(first.rawRefreshToken).not.toBe(second.rawRefreshToken);
    expect(refreshTokenRepo.items).toHaveLength(2);
  });
});
