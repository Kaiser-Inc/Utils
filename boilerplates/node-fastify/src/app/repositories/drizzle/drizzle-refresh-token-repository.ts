import { and, eq, lt } from "drizzle-orm";
import type { Database } from "../../core/database.js";
import type { RefreshToken, RefreshTokenRepository } from "../refresh-token-repository.js";
import { refreshTokens } from "./schema.js";

export class DrizzleRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly db: Database) {}

  async save(token: RefreshToken): Promise<void> {
    await this.db.insert(refreshTokens).values({
      id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
    });
  }

  async findByHash(tokenHash: string): Promise<RefreshToken | null> {
    const rows = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    };
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }

  async deleteExpired(): Promise<void> {
    await this.db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, new Date()));
  }
}
