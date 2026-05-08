import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { TestContext } from "../../helpers/create-test-server.js";
import { createTestServer, registerAndLogin } from "../../helpers/create-test-server.js";

describe("PUT /users/me", () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await createTestServer();
  });

  afterEach(async () => {
    await ctx.app.close();
  });

  it("should update username", async () => {
    const { authHeader } = await registerAndLogin(ctx.app);

    const response = await ctx.app.inject({
      method: "PUT",
      url: "/users/me",
      headers: { authorization: authHeader },
      payload: { username: "pedro_updated" },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.username).toBe("pedro_updated");
  });

  it("should update email", async () => {
    const { authHeader } = await registerAndLogin(ctx.app);

    const response = await ctx.app.inject({
      method: "PUT",
      url: "/users/me",
      headers: { authorization: authHeader },
      payload: { email: "new@example.com" },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.email).toBe("new@example.com");
  });

  it("should return 409 when email is taken by another user", async () => {
    const { authHeader } = await registerAndLogin(ctx.app);

    await ctx.app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { username: "other", email: "other@example.com", password: "password123" },
    });

    const response = await ctx.app.inject({
      method: "PUT",
      url: "/users/me",
      headers: { authorization: authHeader },
      payload: { email: "other@example.com" },
    });

    expect(response.statusCode).toBe(409);
  });

  it("should return 401 when not authenticated", async () => {
    const response = await ctx.app.inject({
      method: "PUT",
      url: "/users/me",
      payload: { username: "hacker" },
    });

    expect(response.statusCode).toBe(401);
  });
});
