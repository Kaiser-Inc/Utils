import type { FastifyReply, FastifyRequest } from "fastify";
import { InvalidCredentialsError } from "../../../domain/errors.js";
import type { RefreshTokenRepository } from "../../../repositories/refresh-token-repository.js";
import type { UserRepository } from "../../../repositories/user-repository.js";
import { AuthenticateUserService } from "../../../services/authenticate-user.js";

const REFRESH_TOKEN_COOKIE = "refresh_token";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type LoginBody = { email: string; password: string };

export class LoginController {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
  ) {}

  handle = async (
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const service = new AuthenticateUserService(
      this.userRepo,
      this.refreshTokenRepo,
      request.server,
    );

    try {
      const result = await service.execute(request.body);

      reply.setCookie(REFRESH_TOKEN_COOKIE, result.rawRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SEVEN_DAYS_MS / 1000,
      });

      return reply.status(200).send({
        access_token: result.accessToken,
        token_type: result.tokenType,
      });
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        return reply.status(401).send({ error: err.message });
      }
      throw err;
    }
  };
}
