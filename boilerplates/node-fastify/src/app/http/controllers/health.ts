import type { FastifyReply, FastifyRequest } from "fastify";

export class HealthController {
  handle = async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    return reply.status(200).send({ status: "ok", timestamp: new Date().toISOString() });
  };
}
