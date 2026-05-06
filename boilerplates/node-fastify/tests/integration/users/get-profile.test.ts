import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { TestContext } from "../../helpers/create-test-server.js";
import { createTestServer, registerAndLogin } from "../../helpers/create-test-server.js";

describe("GET /users/me", () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await createTestServer();
  });

  afterEach(async () => {
    await ctx.app.close();
  });

  it("should return the current user profile", async () => {
    const { authHeader } = await registerAndLogin(ctx.app);

    const response = await ctx.app.inject({
      method: "GET",
      url: "/users/me",
      headers: { authorization: authHeader },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.username).toBe("pedro");
    expect(body.email).toBe("pedro@example.com");
    expect(body.hashedPassword).toBeUndefined();
  });

  it("should return 401 when not authenticated", async () => {
    const response = await ctx.app.inject({
      method: "GET",
      url: "/users/me",
    });

    expect(response.statusCode).toBe(401);
  });
});
