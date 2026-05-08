import type { FastifyReply, FastifyRequest } from "fastify";
import { InvalidRefreshTokenError } from "../../../domain/errors.js";
import type { RefreshTokenRepository } from "../../../repositories/refresh-token-repository.js";
import type { UserRepository } from "../../../repositories/user-repository.js";
import { RefreshTokenService } from "../../../services/auth/refresh-token-service.js";

const REFRESH_TOKEN_COOKIE = "refresh_token";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export class RefreshController {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
  ) {}

  handle = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const rawToken = request.cookies[REFRESH_TOKEN_COOKIE];

    if (!rawToken) {
      return reply.status(401).send({ error: "Refresh token not found" });
    }

    const service = new RefreshTokenService(this.userRepo, this.refreshTokenRepo, request.server);

    try {
      const result = await service.execute(rawToken);

      reply.setCookie(REFRESH_TOKEN_COOKIE, result.rawRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SEVEN_DAYS_MS / 1000,
      });

      return reply.status(200).send({
        access_token: result.accessToken,
        token_type: "bearer" as const,
      });
    } catch (err) {
      if (err instanceof InvalidRefreshTokenError) {
        return reply.status(401).send({ error: err.message });
      }
      throw err;
    }
  };
}
