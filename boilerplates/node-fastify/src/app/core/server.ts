import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import ScalarApiReference from "@scalar/fastify-api-reference";
import Fastify, { type FastifyInstance } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import "./types.js";
import type { RefreshTokenRepository } from "../repositories/refresh-token-repository.js";
import type { UserRepository } from "../repositories/user-repository.js";
import { authRoutes } from "../http/routes/auth.routes.js";
import { healthRoutes } from "../http/routes/health.routes.js";
import { userRoutes } from "../http/routes/users.routes.js";
import { corsOptions } from "./cors.js";
import { settings } from "./settings.js";

export interface ServerDependencies {
  userRepo: UserRepository;
  refreshTokenRepo: RefreshTokenRepository;
}

export async function createServer(deps: ServerDependencies): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: settings.NODE_ENV !== "test",
  });

  // Zod type provider — valida request bodies via schemas Zod e gera JSON Schema para o OpenAPI
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.1",
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
            type: "http",
            scheme: "bearer",
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
  });

  if (settings.NODE_ENV !== "test") {
    await fastify.register(ScalarApiReference, {
      routePrefix: "/docs",
      configuration: {
        title: "Node Fastify Boilerplate API",
        theme: "purple",
        defaultHttpClient: { targetKey: "js", clientKey: "fetch" },
      },
    });
  }

  await fastify.register(fastifyCors, corsOptions);
  await fastify.register(fastifyCookie);
  await fastify.register(fastifyJwt, { secret: settings.SECRET_KEY });

  await healthRoutes(fastify);
  await authRoutes(fastify, deps);
  await userRoutes(fastify, deps);

  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);
    return reply.status(500).send({ error: "Internal server error" });
  });

  return fastify;
}
