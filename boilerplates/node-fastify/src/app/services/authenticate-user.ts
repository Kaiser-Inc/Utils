import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { verifyPassword } from "../core/security.js";
import { InvalidCredentialsError } from "../domain/errors.js";
import type { RefreshTokenRepository } from "../repositories/refresh-token-repository.js";
import type { UserRepository } from "../repositories/user-repository.js";
import { TokenService } from "./auth/token-service.js";

export interface AuthenticateUserInput {
  email: string;
  password: string;
}

export interface AuthenticateUserOutput {
  accessToken: string;
  rawRefreshToken: string;
  tokenType: string;
}

export class AuthenticateUserService {
  private readonly tokenService: TokenService;

  constructor(
    private readonly userRepo: UserRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    fastify: FastifyInstance,
  ) {
    this.tokenService = new TokenService(fastify);
  }

  async execute(input: AuthenticateUserInput): Promise<AuthenticateUserOutput> {
    const user = await this.userRepo.findByEmail(input.email.toLowerCase().trim());
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const valid = await verifyPassword(user.hashedPassword, input.password);
    if (!valid) {
      throw new InvalidCredentialsError();
    }

    const accessToken = this.tokenService.generateAccessToken({ sub: user.id, role: user.role });
    const { raw, hash, expiresAt } = this.tokenService.generateRefreshToken();

    await this.refreshTokenRepo.save({
      id: randomUUID(),
      userId: user.id,
      tokenHash: hash,
      expiresAt,
      createdAt: new Date(),
    });

    return {
      accessToken,
      rawRefreshToken: raw,
      tokenType: "bearer",
    };
  }
}
