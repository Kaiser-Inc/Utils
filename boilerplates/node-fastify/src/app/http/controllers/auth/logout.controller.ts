import type { FastifyReply, FastifyRequest } from "fastify";
import "../../../core/types.js";
import type { RefreshTokenRepository } from "../../../repositories/refresh-token-repository.js";

const REFRESH_TOKEN_COOKIE = "refresh_token";

export class LogoutController {
  constructor(private readonly refreshTokenRepo: RefreshTokenRepository) {}

  handle = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    await this.refreshTokenRepo.deleteByUserId(request.user.sub);
    reply.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
    return reply.status(204).send();
  };
}
