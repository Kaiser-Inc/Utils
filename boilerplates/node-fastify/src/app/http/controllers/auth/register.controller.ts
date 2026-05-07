import type { FastifyReply, FastifyRequest } from "fastify";
import {
  EmailAlreadyInUseError,
  UsernameAlreadyTakenError,
} from "../../../domain/errors.js";
import type { UserRepository } from "../../../repositories/user-repository.js";
import { RegisterUserService } from "../../../services/register-user.js";

type RegisterBody = { username: string; email: string; password: string };

export class RegisterController {
  constructor(private readonly userRepo: UserRepository) {}

  handle = async (
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const service = new RegisterUserService(this.userRepo);

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
  };
}
