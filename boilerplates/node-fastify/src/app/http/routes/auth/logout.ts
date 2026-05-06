import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import "../../../core/types.js";
import type { RefreshTokenRepository } from "../../../repositories/refresh-token-repository.js";
import type { UserRepository } from "../../../repositories/user-repository.js";
import { authenticate } from "../../hooks/authenticate.js";
import { ErrorSchema } from "../../schemas/index.js";

const REFRESH_TOKEN_COOKIE = "refresh_token";

export async function logoutRoute(
  fastify: FastifyInstance,
  _userRepo: UserRepository,
  refreshTokenRepo: RefreshTokenRepository,
): Promise<void> {
  fastify.withTypeProvider<ZodTypeProvider>().patch("/auth/logout", {
    schema: {
      tags: ["Auth"],
      summary: "Logout — revoke all refresh tokens",
      security: [{ bearerAuth: [] }],
      response: {
        204: { type: "null", description: "Logged out successfully" },
        401: ErrorSchema,
      },
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    await refreshTokenRepo.deleteByUserId(request.user.sub);
    reply.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
    return reply.status(204).send();
  });
}
