import type { FastifyReply, FastifyRequest } from "fastify";
import "../../../core/types.js";
import { UserNotFoundError } from "../../../domain/errors.js";
import type { UserRepository } from "../../../repositories/user-repository.js";
import { GetUserService } from "../../../services/get-user.js";

export class GetProfileController {
  constructor(private readonly userRepo: UserRepository) {}

  handle = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const service = new GetUserService(this.userRepo);

    try {
      const profile = await service.execute(request.user.sub);
      return reply.status(200).send(profile);
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        return reply.status(404).send({ error: err.message });
      }
      throw err;
    }
  };
}
