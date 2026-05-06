import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import "../../../core/types.js";
import { UserNotFoundError } from "../../../domain/errors.js";
import type { UserRepository } from "../../../repositories/user-repository.js";
import { GetUserService } from "../../../services/get-user.js";
import { authenticate } from "../../hooks/authenticate.js";
import { ErrorSchema, UserSchema } from "../../schemas/index.js";

export async function getProfileRoute(
  fastify: FastifyInstance,
  userRepo: UserRepository,
): Promise<void> {
  fastify.withTypeProvider<ZodTypeProvider>().get("/users/me", {
    schema: {
      tags: ["Users"],
      summary: "Get current user profile",
      security: [{ bearerAuth: [] }],
      response: {
        200: UserSchema,
        401: ErrorSchema,
        404: ErrorSchema,
      },
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const service = new GetUserService(userRepo);

    try {
      const profile = await service.execute(request.user.sub);
      return reply.status(200).send(profile);
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        return reply.status(404).send({ error: err.message });
      }
      throw err;
    }
  });
}
