import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { TestContext } from "../../helpers/create-test-server.js";
import { createTestServer } from "../../helpers/create-test-server.js";

describe("POST /auth/session", () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await createTestServer();
    await ctx.app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { username: "pedro", email: "pedro@example.com", password: "password123" },
    });
  });

  afterEach(async () => {
    await ctx.app.close();
  });

  it("should return access token and set refresh cookie on valid credentials", async () => {
    const response = await ctx.app.inject({
      method: "POST",
      url: "/auth/session",
      payload: { email: "pedro@example.com", password: "password123" },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.access_token).toBeDefined();
    expect(body.token_type).toBe("bearer");

    const setCookie = response.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    expect(String(setCookie)).toContain("refresh_token=");
    expect(String(setCookie)).toContain("HttpOnly");
  });

  it("should return 401 on wrong password", async () => {
    const response = await ctx.app.inject({
      method: "POST",
      url: "/auth/session",
      payload: { email: "pedro@example.com", password: "wrongpassword" },
    });

    expect(response.statusCode).toBe(401);
  });

  it("should return 401 when user does not exist", async () => {
    const response = await ctx.app.inject({
      method: "POST",
      url: "/auth/session",
      payload: { email: "ghost@example.com", password: "password123" },
    });

    expect(response.statusCode).toBe(401);
  });
});
