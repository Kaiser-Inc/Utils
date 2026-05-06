import { UserNotFoundError } from "../domain/errors.js";
import type { RefreshTokenRepository } from "../repositories/refresh-token-repository.js";
import type { UserRepository } from "../repositories/user-repository.js";

export class DeleteUserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    await this.refreshTokenRepo.deleteByUserId(userId);
    await this.userRepo.delete(userId);
  }
}
