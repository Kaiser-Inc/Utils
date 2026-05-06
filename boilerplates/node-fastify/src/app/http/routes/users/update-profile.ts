import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import "../../../core/types.js";
import {
  EmailAlreadyInUseError,
  UserNotFoundError,
  UsernameAlreadyTakenError,
} from "../../../domain/errors.js";
import type { UserRepository } from "../../../repositories/user-repository.js";
import { UpdateUserService } from "../../../services/update-user.js";
import { authenticate } from "../../hooks/authenticate.js";
import { ErrorSchema, UserSchema } from "../../schemas/index.js";

const UpdateBodySchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
});

export async function updateProfileRoute(
  fastify: FastifyInstance,
  userRepo: UserRepository,
): Promise<void> {
  fastify.withTypeProvider<ZodTypeProvider>().put("/users/me", {
    schema: {
      tags: ["Users"],
      summary: "Update current user profile",
      security: [{ bearerAuth: [] }],
      body: UpdateBodySchema,
      response: {
        200: UserSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        409: ErrorSchema,
        422: ErrorSchema,
      },
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const service = new UpdateUserService(userRepo);

    try {
      const updated = await service.execute({ userId: request.user.sub, ...request.body });
      return reply.status(200).send(updated);
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        return reply.status(404).send({ error: err.message });
      }
      if (err instanceof EmailAlreadyInUseError || err instanceof UsernameAlreadyTakenError) {
        return reply.status(409).send({ error: err.message });
      }
      if (err instanceof Error) {
        return reply.status(422).send({ error: err.message });
      }
      throw err;
    }
  });
}
