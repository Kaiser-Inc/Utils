import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { TestContext } from "../helpers/create-test-server.js";
import { createTestServer } from "../helpers/create-test-server.js";

describe("GET /health", () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await createTestServer();
  });

  afterEach(async () => {
    await ctx.app.close();
  });

  it("should return 200 with status ok", async () => {
    const response = await ctx.app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
    expect(typeof body.timestamp).toBe("string");
  });
});
