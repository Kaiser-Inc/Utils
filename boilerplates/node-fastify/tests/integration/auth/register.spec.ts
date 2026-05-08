import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { TestContext } from "../../helpers/create-test-server.js";
import { createTestServer } from "../../helpers/create-test-server.js";

describe("POST /auth/register", () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await createTestServer();
  });

  afterEach(async () => {
    await ctx.app.close();
  });

  it("should register a new user and return 201", async () => {
    const response = await ctx.app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        username: "pedro",
        email: "pedro@example.com",
        password: "password123",
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.id).toBeDefined();
    expect(body.username).toBe("pedro");
    expect(body.email).toBe("pedro@example.com");
    expect(body.role).toBe("user");
    expect(body.hashedPassword).toBeUndefined();
  });

  it("should return 409 when email is already in use", async () => {
    await ctx.app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { username: "pedro", email: "pedro@example.com", password: "password123" },
    });

    const response = await ctx.app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { username: "pedro2", email: "pedro@example.com", password: "password456" },
    });

    expect(response.statusCode).toBe(409);
  });

  it("should return 400 when body is invalid", async () => {
    const response = await ctx.app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { username: "p", email: "not-an-email", password: "123" },
    });

    expect(response.statusCode).toBe(400);
  });
});
