import type { FastifyInstance } from "fastify";
import type { RefreshTokenRepository } from "../../../repositories/refresh-token-repository.js";
import type { UserRepository } from "../../../repositories/user-repository.js";
import { deleteUserRoute } from "./delete-user.js";
import { getProfileRoute } from "./get-profile.js";
import { updateProfileRoute } from "./update-profile.js";

export async function userRoutes(
  fastify: FastifyInstance,
  userRepo: UserRepository,
  refreshTokenRepo: RefreshTokenRepository,
): Promise<void> {
  await getProfileRoute(fastify, userRepo);
  await updateProfileRoute(fastify, userRepo);
  await deleteUserRoute(fastify, userRepo, refreshTokenRepo);
}
