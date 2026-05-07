import type { FastifyReply, FastifyRequest } from "fastify";
import "../../../core/types.js";
import {
  EmailAlreadyInUseError,
  UserNotFoundError,
  UsernameAlreadyTakenError,
} from "../../../domain/errors.js";
import type { UserRepository } from "../../../repositories/user-repository.js";
import { UpdateUserService } from "../../../services/update-user.js";

type UpdateBody = { username?: string | undefined; email?: string | undefined };

export class UpdateProfileController {
  constructor(private readonly userRepo: UserRepository) {}

  handle = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const service = new UpdateUserService(this.userRepo);
    const { username, email } = request.body as UpdateBody;

    try {
      const updated = await service.execute({ userId: request.user.sub, username, email });
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
  };
}
