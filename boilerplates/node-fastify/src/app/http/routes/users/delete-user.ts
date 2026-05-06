import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import "../../../core/types.js";
import { UserNotFoundError } from "../../../domain/errors.js";
import type { RefreshTokenRepository } from "../../../repositories/refresh-token-repository.js";
import type { UserRepository } from "../../../repositories/user-repository.js";
import { DeleteUserService } from "../../../services/delete-user.js";
import { authenticate } from "../../hooks/authenticate.js";
import { ErrorSchema } from "../../schemas/index.js";

export async function deleteUserRoute(
  fastify: FastifyInstance,
  userRepo: UserRepository,
  refreshTokenRepo: RefreshTokenRepository,
): Promise<void> {
  fastify.withTypeProvider<ZodTypeProvider>().delete("/users/me", {
    schema: {
      tags: ["Users"],
      summary: "Delete current user account",
      security: [{ bearerAuth: [] }],
      response: {
        204: { type: "null", description: "Account deleted successfully" },
        401: ErrorSchema,
        404: ErrorSchema,
      },
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const service = new DeleteUserService(userRepo, refreshTokenRepo);

    try {
      await service.execute(request.user.sub);
      return reply.status(204).send();
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        return reply.status(404).send({ error: err.message });
      }
      throw err;
    }
  });
}
