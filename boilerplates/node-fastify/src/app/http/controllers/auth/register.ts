import type { FastifyReply, FastifyRequest } from "fastify";
import { EmailAlreadyInUseError, UsernameAlreadyTakenError } from "../../../domain/errors.js";
import type { RegisterUserService } from "../../../services/register-user.js";

type RegisterBody = { username: string; email: string; password: string };

export class RegisterController {
  constructor(private readonly service: RegisterUserService) {}

  handle = async (
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply,
  ): Promise<void> => {
    try {
      const user = await this.service.execute(request.body);
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
  };
}
