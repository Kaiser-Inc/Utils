import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { HealthSchema } from "../schemas/index.js";

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.withTypeProvider<ZodTypeProvider>().get("/health", {
    schema: {
      tags: ["Health"],
      summary: "Health check",
      security: [],
      response: { 200: HealthSchema },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({ status: "ok", timestamp: new Date().toISOString() });
  });
}
