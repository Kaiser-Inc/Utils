import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { HealthController } from "../controllers/health.js";
import { HealthSchema } from "../schemas/index.js";

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  const health = new HealthController();

  fastify.withTypeProvider<ZodTypeProvider>().get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        summary: "Health check",
        security: [],
        response: { 200: HealthSchema },
      },
    },
    health.handle,
  );
}
