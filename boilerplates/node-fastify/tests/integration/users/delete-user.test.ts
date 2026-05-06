import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { TestContext } from "../../helpers/create-test-server.js";
import { createTestServer, registerAndLogin } from "../../helpers/create-test-server.js";

describe("DELETE /users/me", () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await createTestServer();
  });

  afterEach(async () => {
    await ctx.app.close();
  });

  it("should delete the current user", async () => {
    const { authHeader } = await registerAndLogin(ctx.app);

    const response = await ctx.app.inject({
      method: "DELETE",
      url: "/users/me",
      headers: { authorization: authHeader },
    });

    expect(response.statusCode).toBe(204);
    expect(ctx.userRepo.items).toHaveLength(0);
  });

  it("should revoke refresh tokens on delete", async () => {
    const { authHeader, cookieHeader } = await registerAndLogin(ctx.app);

    await ctx.app.inject({
      method: "DELETE",
      url: "/users/me",
      headers: { authorization: authHeader },
    });

    expect(ctx.refreshTokenRepo.items).toHaveLength(0);

    const refreshResponse = await ctx.app.inject({
      method: "PATCH",
      url: "/auth/refresh",
      headers: { cookie: cookieHeader },
    });
    expect(refreshResponse.statusCode).toBe(401);
  });

  it("should return 401 when not authenticated", async () => {
    const response = await ctx.app.inject({
      method: "DELETE",
      url: "/users/me",
    });

    expect(response.statusCode).toBe(401);
  });
});
