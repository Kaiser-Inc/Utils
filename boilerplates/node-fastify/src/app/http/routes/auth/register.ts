import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  EmailAlreadyInUseError,
  UsernameAlreadyTakenError,
} from "../../../domain/errors.js";
import type { RefreshTokenRepository } from "../../../repositories/refresh-token-repository.js";
import type { UserRepository } from "../../../repositories/user-repository.js";
import { RegisterUserService } from "../../../services/register-user.js";
import { ErrorSchema, UserSchema } from "../../schemas/index.js";

const RegisterBodySchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function registerRoute(
  fastify: FastifyInstance,
  userRepo: UserRepository,
  _refreshTokenRepo: RefreshTokenRepository,
): Promise<void> {
  fastify.withTypeProvider<ZodTypeProvider>().post("/auth/register", {
    schema: {
      tags: ["Auth"],
      summary: "Register a new user",
      security: [],
      body: RegisterBodySchema,
      response: {
        201: UserSchema,
        409: ErrorSchema,
        422: ErrorSchema,
      },
    },
  }, async (request, reply) => {
    const service = new RegisterUserService(userRepo);

    try {
      const user = await service.execute(request.body);
      return reply.status(201).send(user);
    } catch (err) {
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
