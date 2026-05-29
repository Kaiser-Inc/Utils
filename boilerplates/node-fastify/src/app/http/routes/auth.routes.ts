import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { ServerDependencies } from "../../core/server.js";
import { RegisterUserService } from "../../services/register-user.js";
import { LoginController } from "../controllers/auth/login.js";
import { LogoutController } from "../controllers/auth/logout.js";
import { RefreshController } from "../controllers/auth/refresh.js";
import { RegisterController } from "../controllers/auth/register.js";
import { authenticate } from "../middlewares/authenticate.js";
import {
  AccessTokenSchema,
  ErrorSchema,
  LoginBodySchema,
  RegisterBodySchema,
  UserSchema,
} from "../schemas/index.js";

// ─── Route Schemas (defined at module level to keep route handlers lean) ──────

const loginSchema = {
  tags: ["Auth"],
  summary: "Login — returns access token and sets refresh cookie",
  security: [] as { [securityLabel: string]: string[] }[],
  body: LoginBodySchema,
  response: { 200: AccessTokenSchema, 401: ErrorSchema },
};

const registerSchema = {
  tags: ["Auth"],
  summary: "Register a new user",
  security: [] as { [securityLabel: string]: string[] }[],
  body: RegisterBodySchema,
  response: { 201: UserSchema, 409: ErrorSchema, 422: ErrorSchema },
};

const refreshSchema = {
  tags: ["Auth"],
  summary: "Refresh access token using HTTP-only cookie",
  description: "Reads the `refresh_token` HTTP-only cookie. Rotates the token on each call.",
  security: [] as { [securityLabel: string]: string[] }[],
  response: { 200: AccessTokenSchema, 401: ErrorSchema },
};

const logoutSchema = {
  tags: ["Auth"],
  summary: "Logout — revoke all refresh tokens",
  security: [{ bearerAuth: [] }],
  response: {
    204: { type: "null", description: "Logged out successfully" },
    401: ErrorSchema,
  },
};

// ─── Plugin ───────────────────────────────────────────────────────────────────

export async function authRoutes(
  fastify: FastifyInstance,
  deps: ServerDependencies,
): Promise<void> {
  const login = new LoginController(deps.userRepo, deps.refreshTokenRepo);
  const register = new RegisterController(new RegisterUserService(deps.userRepo));
  const refresh = new RefreshController(deps.userRepo, deps.refreshTokenRepo);
  const logout = new LogoutController(deps.refreshTokenRepo);

  const f = fastify.withTypeProvider<ZodTypeProvider>();

  f.post("/auth/session", { schema: loginSchema }, login.handle);
  f.post("/auth/register", { schema: registerSchema }, register.handle);
  f.patch("/auth/refresh", { schema: refreshSchema }, refresh.handle);
  f.patch("/auth/logout", { schema: logoutSchema, preHandler: [authenticate] }, logout.handle);
}
