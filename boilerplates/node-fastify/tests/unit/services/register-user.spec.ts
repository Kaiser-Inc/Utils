import { beforeEach, describe, expect, it } from "vitest";
import {
  EmailAlreadyInUseError,
  UsernameAlreadyTakenError,
} from "../../../src/app/domain/errors.js";
import { InMemoryUserRepository } from "../../../src/app/repositories/in-memory/in-memory-user-repository.js";
import { RegisterUserService } from "../../../src/app/services/register-user.js";

describe("RegisterUserService", () => {
  let userRepo: InMemoryUserRepository;
  let service: RegisterUserService;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    service = new RegisterUserService(userRepo);
  });

  it("should register a new user", async () => {
    const output = await service.execute({
      username: "pedro",
      email: "pedro@example.com",
      password: "password123",
    });

    expect(output.id).toBeDefined();
    expect(output.username).toBe("pedro");
    expect(output.email).toBe("pedro@example.com");
    expect(output.role).toBe("user");
    expect(userRepo.items).toHaveLength(1);
  });

  it("should throw EmailAlreadyInUseError when email is taken", async () => {
    await service.execute({
      username: "pedro",
      email: "pedro@example.com",
      password: "password123",
    });

    await expect(
      service.execute({
        username: "pedro2",
        email: "pedro@example.com",
        password: "password456",
      }),
    ).rejects.toThrow(EmailAlreadyInUseError);
  });

  it("should throw UsernameAlreadyTakenError when username is taken", async () => {
    await service.execute({
      username: "pedro",
      email: "pedro@example.com",
      password: "password123",
    });

    await expect(
      service.execute({
        username: "pedro",
        email: "pedro2@example.com",
        password: "password456",
      }),
    ).rejects.toThrow(UsernameAlreadyTakenError);
  });

  it("should normalize email to lowercase", async () => {
    const output = await service.execute({
      username: "pedro",
      email: "PEDRO@EXAMPLE.COM",
      password: "password123",
    });

    expect(output.email).toBe("pedro@example.com");
  });
});
