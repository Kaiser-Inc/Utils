import type { FastifyReply, FastifyRequest } from "fastify";
import "../../../core/types.js";
import { UserNotFoundError } from "../../../domain/errors.js";
import type { DeleteUserService } from "../../../services/delete-user.js";

export class DeleteUserController {
  constructor(private readonly service: DeleteUserService) {}

  handle = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      await this.service.execute(request.user.sub);
      return reply.status(204).send();
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        return reply.status(404).send({ error: err.message });
      }
      throw err;
    }
  };
}
