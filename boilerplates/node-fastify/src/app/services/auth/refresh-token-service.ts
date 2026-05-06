import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { InvalidRefreshTokenError, UserNotFoundError } from "../../domain/errors.js";
import type { RefreshTokenRepository } from "../../repositories/refresh-token-repository.js";
import type { UserRepository } from "../../repositories/user-repository.js";
import { TokenService } from "./token-service.js";

export interface RefreshResult {
  accessToken: string;
  rawRefreshToken: string;
}

export class RefreshTokenService {
  private readonly tokenService: TokenService;

  constructor(
    private readonly userRepo: UserRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    fastify: FastifyInstance,
  ) {
    this.tokenService = new TokenService(fastify);
  }

  async execute(rawToken: string): Promise<RefreshResult> {
    const hash = this.tokenService.hashToken(rawToken);
    const stored = await this.refreshTokenRepo.findByHash(hash);

    if (!stored) {
      throw new InvalidRefreshTokenError();
    }

    const user = await this.userRepo.findById(stored.userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Rotate: revoke existing tokens for user
    await this.refreshTokenRepo.deleteByUserId(user.id);

    const accessToken = this.tokenService.generateAccessToken({ sub: user.id, role: user.role });
    const { raw, hash: newHash, expiresAt } = this.tokenService.generateRefreshToken();

    await this.refreshTokenRepo.save({
      id: randomUUID(),
      userId: user.id,
      tokenHash: newHash,
      expiresAt,
      createdAt: new Date(),
    });

    return { accessToken, rawRefreshToken: raw };
  }
}
