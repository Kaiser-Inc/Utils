import type { FastifyReply, FastifyRequest } from "fastify";
import "../../../core/types.js";
import { UserNotFoundError } from "../../../domain/errors.js";
import type { GetUserService } from "../../../services/get-user.js";

export class GetProfileController {
  constructor(private readonly service: GetUserService) {}

  handle = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const profile = await this.service.execute(request.user.sub);
      return reply.status(200).send(profile);
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        return reply.status(404).send({ error: err.message });
      }
      throw err;
    }
  };
}
