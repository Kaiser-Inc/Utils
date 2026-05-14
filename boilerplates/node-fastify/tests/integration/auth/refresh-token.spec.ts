import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { TestContext } from "../../helpers/create-test-server.js";
import { createTestServer, registerAndLogin } from "../../helpers/create-test-server.js";

describe("PATCH /auth/refresh", () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await createTestServer();
  });

  afterEach(async () => {
    await ctx.app.close();
  });

  it("should return new tokens when refresh cookie is valid", async () => {
    const { cookieHeader } = await registerAndLogin(ctx.app);

    const response = await ctx.app.inject({
      method: "PATCH",
      url: "/auth/refresh",
      headers: { cookie: cookieHeader },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.access_token).toBeDefined();
    expect(body.token_type).toBe("bearer");

    const newCookie = response.headers["set-cookie"];
    expect(newCookie).toBeDefined();
    expect(String(newCookie)).toContain("refresh_token=");
  });

  it("should return 401 when no refresh cookie is present", async () => {
    const response = await ctx.app.inject({
      method: "PATCH",
      url: "/auth/refresh",
    });

    expect(response.statusCode).toBe(401);
  });

  it("should invalidate old refresh token after rotation", async () => {
    const { cookieHeader } = await registerAndLogin(ctx.app);

    // First refresh - get new tokens
    await ctx.app.inject({
      method: "PATCH",
      url: "/auth/refresh",
      headers: { cookie: cookieHeader },
    });

    // Try to reuse the old token - should fail
    const response = await ctx.app.inject({
      method: "PATCH",
      url: "/auth/refresh",
      headers: { cookie: cookieHeader },
    });

    expect(response.statusCode).toBe(401);
  });

  it("deleteExpired() should remove expired tokens from the store", async () => {
    await registerAndLogin(ctx.app);

    const pastDate = new Date(Date.now() - 1000);
    ctx.refreshTokenRepo.items.forEach((t) => {
      (t as { expiresAt: Date }).expiresAt = pastDate;
    });

    expect(ctx.refreshTokenRepo.items.length).toBeGreaterThan(0);
    await ctx.refreshTokenRepo.deleteExpired();
    expect(ctx.refreshTokenRepo.items).toHaveLength(0);
  });
});
