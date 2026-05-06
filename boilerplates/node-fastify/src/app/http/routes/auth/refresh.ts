import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { InvalidRefreshTokenError } from "../../../domain/errors.js";
import type { RefreshTokenRepository } from "../../../repositories/refresh-token-repository.js";
import type { UserRepository } from "../../../repositories/user-repository.js";
import { RefreshTokenService } from "../../../services/auth/refresh-token-service.js";
import { AccessTokenSchema, ErrorSchema } from "../../schemas/index.js";

const REFRESH_TOKEN_COOKIE = "refresh_token";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function refreshRoute(
  fastify: FastifyInstance,
  userRepo: UserRepository,
  refreshTokenRepo: RefreshTokenRepository,
): Promise<void> {
  fastify.withTypeProvider<ZodTypeProvider>().patch("/auth/refresh", {
    schema: {
      tags: ["Auth"],
      summary: "Refresh access token using HTTP-only cookie",
      security: [],
      description: "Reads the `refresh_token` HTTP-only cookie. Rotates the token on each call.",
      response: {
        200: AccessTokenSchema,
        401: ErrorSchema,
      },
    },
  }, async (request, reply) => {
    const rawToken = request.cookies[REFRESH_TOKEN_COOKIE];

    if (!rawToken) {
      return reply.status(401).send({ error: "Refresh token not found" });
    }

    const service = new RefreshTokenService(userRepo, refreshTokenRepo, fastify);

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
        token_type: "bearer",
      });
    } catch (err) {
      if (err instanceof InvalidRefreshTokenError) {
        return reply.status(401).send({ error: err.message });
      }
      throw err;
    }
  });
}
