import type { FastifyInstance } from "fastify";
import type { RefreshTokenRepository } from "../../../repositories/refresh-token-repository.js";
import type { UserRepository } from "../../../repositories/user-repository.js";
import { loginRoute } from "./login.js";
import { logoutRoute } from "./logout.js";
import { refreshRoute } from "./refresh.js";
import { registerRoute } from "./register.js";

export async function authRoutes(
  fastify: FastifyInstance,
  userRepo: UserRepository,
  refreshTokenRepo: RefreshTokenRepository,
): Promise<void> {
  await registerRoute(fastify, userRepo, refreshTokenRepo);
  await loginRoute(fastify, userRepo, refreshTokenRepo);
  await refreshRoute(fastify, userRepo, refreshTokenRepo);
  await logoutRoute(fastify, userRepo, refreshTokenRepo);
}
