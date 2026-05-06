import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { InvalidCredentialsError } from "../../../domain/errors.js";
import type { RefreshTokenRepository } from "../../../repositories/refresh-token-repository.js";
import type { UserRepository } from "../../../repositories/user-repository.js";
import { AuthenticateUserService } from "../../../services/authenticate-user.js";
import { AccessTokenSchema, ErrorSchema } from "../../schemas/index.js";

const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const REFRESH_TOKEN_COOKIE = "refresh_token";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function loginRoute(
  fastify: FastifyInstance,
  userRepo: UserRepository,
  refreshTokenRepo: RefreshTokenRepository,
): Promise<void> {
  fastify.withTypeProvider<ZodTypeProvider>().post("/auth/session", {
    schema: {
      tags: ["Auth"],
      summary: "Login — returns access token and sets refresh cookie",
      security: [],
      body: LoginBodySchema,
      response: {
        200: AccessTokenSchema,
        401: ErrorSchema,
      },
    },
  }, async (request, reply) => {
    const service = new AuthenticateUserService(userRepo, refreshTokenRepo, fastify);

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
  });
}
