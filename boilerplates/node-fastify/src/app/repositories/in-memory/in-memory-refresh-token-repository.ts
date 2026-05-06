import type { RefreshToken, RefreshTokenRepository } from "../refresh-token-repository.js";

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  public items: RefreshToken[] = [];

  async save(token: RefreshToken): Promise<void> {
    this.items.push(token);
  }

  async findByHash(tokenHash: string): Promise<RefreshToken | null> {
    const now = new Date();
    return (
      this.items.find((t) => t.tokenHash === tokenHash && t.expiresAt > now) ?? null
    );
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.items = this.items.filter((t) => t.userId !== userId);
  }

  async deleteExpired(): Promise<void> {
    const now = new Date();
    this.items = this.items.filter((t) => t.expiresAt > now);
  }
}
