import type { FastifyInstance } from "fastify";
import { createServer } from "../../src/app/core/server.js";
import { InMemoryRefreshTokenRepository } from "../../src/app/repositories/in-memory/in-memory-refresh-token-repository.js";
import { InMemoryUserRepository } from "../../src/app/repositories/in-memory/in-memory-user-repository.js";

export interface TestContext {
  app: FastifyInstance;
  userRepo: InMemoryUserRepository;
  refreshTokenRepo: InMemoryRefreshTokenRepository;
}

export async function createTestServer(): Promise<TestContext> {
  const userRepo = new InMemoryUserRepository();
  const refreshTokenRepo = new InMemoryRefreshTokenRepository();

  const app = await createServer({ userRepo, refreshTokenRepo });
  await app.ready();

  return { app, userRepo, refreshTokenRepo };
}

export async function registerAndLogin(
  app: FastifyInstance,
  credentials = { username: "pedro", email: "pedro@example.com", password: "password123" },
) {
  await app.inject({
    method: "POST",
    url: "/auth/register",
    payload: credentials,
  });

  const loginResponse = await app.inject({
    method: "POST",
    url: "/auth/session",
    payload: { email: credentials.email, password: credentials.password },
  });

  const body = JSON.parse(loginResponse.body) as { access_token: string };
  const setCookie = loginResponse.headers["set-cookie"];
  const cookieHeader = Array.isArray(setCookie) ? setCookie[0] : (setCookie ?? "");

  return {
    accessToken: body.access_token,
    authHeader: `Bearer ${body.access_token}`,
    cookieHeader,
  };
}
