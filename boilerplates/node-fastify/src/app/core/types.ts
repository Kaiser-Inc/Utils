import type { Role } from "../domain/role.js";

// Augment Fastify's type declarations for JWT
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string;
      role: Role;
    };
    user: {
      sub: string;
      role: Role;
    };
  }
}
