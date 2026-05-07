import type { FastifyReply, FastifyRequest } from "fastify";
import "../../../core/types.js";
import { UserNotFoundError } from "../../../domain/errors.js";
import type { RefreshTokenRepository } from "../../../repositories/refresh-token-repository.js";
import type { UserRepository } from "../../../repositories/user-repository.js";
import { DeleteUserService } from "../../../services/delete-user.js";

export class DeleteUserController {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
  ) {}

  handle = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const service = new DeleteUserService(this.userRepo, this.refreshTokenRepo);

    try {
      await service.execute(request.user.sub);
      return reply.status(204).send();
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        return reply.status(404).send({ error: err.message });
      }
      throw err;
    }
  };
}
