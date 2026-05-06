import { UserNotFoundError } from "../domain/errors.js";
import { Role } from "../domain/role.js";
import type { UserRepository } from "../repositories/user-repository.js";

export interface GetUserOutput {
  id: string;
  username: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export class GetUserService {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(userId: string): Promise<GetUserOutput> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
