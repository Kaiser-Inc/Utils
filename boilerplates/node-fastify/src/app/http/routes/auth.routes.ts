import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { ServerDependencies } from "../../core/server.js";
import { LoginController } from "../controllers/auth/login.controller.js";
import { LogoutController } from "../controllers/auth/logout.controller.js";
import { RefreshController } from "../controllers/auth/refresh.controller.js";
import { RegisterController } from "../controllers/auth/register.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { AccessTokenSchema, ErrorSchema, UserSchema } from "../schemas/index.js";

export async function authRoutes(
  fastify: FastifyInstance,
  deps: ServerDependencies,
): Promise<void> {
  const login = new LoginController(deps.userRepo, deps.refreshTokenRepo);
  const register = new RegisterController(deps.userRepo);
  const refresh = new RefreshController(deps.userRepo, deps.refreshTokenRepo);
  const logout = new LogoutController(deps.refreshTokenRepo);

  const f = fastify.withTypeProvider<ZodTypeProvider>();

  f.post("/auth/session", {
    schema: {
      tags: ["Auth"],
      summary: "Login — returns access token and sets refresh cookie",
      security: [],
      body: z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }),
      response: {
        200: AccessTokenSchema,
        401: ErrorSchema,
      },
    },
  }, login.handle);

  f.post("/auth/register", {
    schema: {
      tags: ["Auth"],
      summary: "Register a new user",
      security: [],
      body: z.object({
        username: z.string().min(3).max(50),
        email: z.string().email(),
        password: z.string().min(8),
      }),
      response: {
        201: UserSchema,
        409: ErrorSchema,
        422: ErrorSchema,
      },
    },
  }, register.handle);

  f.patch("/auth/refresh", {
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
  }, refresh.handle);

  f.patch("/auth/logout", {
    schema: {
      tags: ["Auth"],
      summary: "Logout — revoke all refresh tokens",
      security: [{ bearerAuth: [] }],
      response: {
        204: { type: "null", description: "Logged out successfully" },
        401: ErrorSchema,
      },
    },
    preHandler: [authenticate],
  }, logout.handle);
}
