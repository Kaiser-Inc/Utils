import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import ScalarApiReference from "@scalar/fastify-api-reference";
import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import "./types.js";
import { DomainError } from "../domain/errors.js";
import { authRoutes } from "../http/routes/auth.routes.js";
import { healthRoutes } from "../http/routes/health.routes.js";
import { userRoutes } from "../http/routes/users.routes.js";
import type { RefreshTokenRepository } from "../repositories/refresh-token-repository.js";
import type { UserRepository } from "../repositories/user-repository.js";
import { corsOptions } from "./cors.js";
import { settings } from "./settings.js";

export interface ServerDependencies {
  userRepo: UserRepository;
  refreshTokenRepo: RefreshTokenRepository;
}

// ─── OpenAPI / Swagger config (module-level to keep createServer lean) ────────

const swaggerOptions = {
  openapi: {
    openapi: "3.0.1" as const,
    info: {
      title: "Node Fastify Boilerplate API",
      version: "1.0.0",
      description:
        "API de autenticação com dual-token JWT. Access token via `Authorization: Bearer`, refresh token via HTTP-only cookie.",
    },
    servers: [{ url: `http://localhost:${settings.PORT}`, description: "Development" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http" as const,
          scheme: "bearer" as const,
          bearerFormat: "JWT",
          description: "Access token JWT. Expira em 15 minutos.",
        },
      },
    },
    tags: [
      { name: "Health", description: "Status da aplicação" },
      { name: "Auth", description: "Registro, login, refresh e logout" },
      { name: "Users", description: "Gerenciamento do perfil autenticado" },
    ],
  },
};

const scalarOptions = {
  routePrefix: "/docs",
  configuration: {
    title: "Node Fastify Boilerplate API",
    theme: "purple",
    defaultHttpClient: { targetKey: "js", clientKey: "fetch" },
  },
} as const;

const DOMAIN_ERROR_STATUS: Record<string, number> = {
  InvalidCredentialsError: 401,
  UnauthorizedError: 401,
  InvalidRefreshTokenError: 401,
  UserNotFoundError: 404,
  EmailAlreadyInUseError: 409,
  UsernameAlreadyTakenError: 409,
};

// ─── Factory ──────────────────────────────────────────────────────────────────

export async function createServer(deps: ServerDependencies): Promise<FastifyInstance> {
  const fastify = Fastify({ logger: settings.NODE_ENV !== "test" });

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  await fastify.register(fastifySwagger, swaggerOptions);

  if (settings.NODE_ENV !== "test") {
    await fastify.register(ScalarApiReference, scalarOptions);
  }

  await fastify.register(fastifyCors, corsOptions);
  await fastify.register(fastifyCookie);
  await fastify.register(fastifyJwt, { secret: settings.SECRET_KEY });

  await healthRoutes(fastify);
  await authRoutes(fastify, deps);
  await userRoutes(fastify, deps);

  fastify.setErrorHandler((error: FastifyError, _request, reply) => {
    if (error instanceof DomainError) {
      const status = DOMAIN_ERROR_STATUS[error.constructor.name] ?? 422;
      return reply.status(status).send({ error: error.message });
    }
    if (error.statusCode && error.statusCode < 500) {
      return reply.status(error.statusCode).send({ error: error.message });
    }
    fastify.log.error(error);
    return reply.status(500).send({ error: "Internal server error" });
  });

  return fastify;
}
