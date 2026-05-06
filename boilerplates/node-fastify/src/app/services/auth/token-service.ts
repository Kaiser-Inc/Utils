import { createHash, randomBytes } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { Role } from "../../domain/role.js";

export interface AccessTokenPayload {
  sub: string;
  role: Role;
}

export interface TokenPair {
  accessToken: string;
  rawRefreshToken: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

export class TokenService {
  constructor(private readonly fastify: FastifyInstance) {}

  generateAccessToken(payload: AccessTokenPayload): string {
    return this.fastify.jwt.sign(
      { sub: payload.sub, role: payload.role },
      { expiresIn: "15m" },
    );
  }

  generateRefreshToken(): { raw: string; hash: string; expiresAt: Date } {
    const raw = randomBytes(40).toString("hex");
    const hash = createHash("sha256").update(raw).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return { raw, hash, expiresAt };
  }

  hashToken(raw: string): string {
    return createHash("sha256").update(raw).digest("hex");
  }
}
