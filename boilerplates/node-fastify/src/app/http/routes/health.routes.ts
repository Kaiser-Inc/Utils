import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { HealthController } from "../controllers/health.js";
import { HealthSchema } from "../schemas/index.js";

const healthSchema = {
  tags: ["Health"],
  summary: "Health check",
  security: [] as { [securityLabel: string]: string[] }[],
  response: { 200: HealthSchema },
};

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  const health = new HealthController();
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .get("/health", { schema: healthSchema }, health.handle);
}
