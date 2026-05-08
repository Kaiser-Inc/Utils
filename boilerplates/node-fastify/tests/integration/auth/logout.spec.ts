import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { TestContext } from "../../helpers/create-test-server.js";
import { createTestServer, registerAndLogin } from "../../helpers/create-test-server.js";

describe("PATCH /auth/logout", () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await createTestServer();
  });

  afterEach(async () => {
    await ctx.app.close();
  });

  it("should logout and revoke refresh tokens", async () => {
    const { authHeader, cookieHeader } = await registerAndLogin(ctx.app);

    const response = await ctx.app.inject({
      method: "PATCH",
      url: "/auth/logout",
      headers: { authorization: authHeader, cookie: cookieHeader },
    });

    expect(response.statusCode).toBe(204);

    // Refresh should now fail
    const refreshResponse = await ctx.app.inject({
      method: "PATCH",
      url: "/auth/refresh",
      headers: { cookie: cookieHeader },
    });
    expect(refreshResponse.statusCode).toBe(401);
  });

  it("should return 401 when no access token is provided", async () => {
    const response = await ctx.app.inject({
      method: "PATCH",
      url: "/auth/logout",
    });

    expect(response.statusCode).toBe(401);
  });
});
