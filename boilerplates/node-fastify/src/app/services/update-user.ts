import {
  EmailAlreadyInUseError,
  UserNotFoundError,
  UsernameAlreadyTakenError,
} from "../domain/errors.js";
import type { Role } from "../domain/role.js";
import { Email } from "../domain/value-objects/email.js";
import { Username } from "../domain/value-objects/username.js";
import type { UserRepository } from "../repositories/user-repository.js";

export interface UpdateUserInput {
  userId: string;
  username?: string;
  email?: string;
}

export interface UpdateUserOutput {
  id: string;
  username: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export class UpdateUserService {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
    const user = await this.userRepo.findById(input.userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    if (input.email) {
      const email = Email.create(input.email);
      const existing = await this.userRepo.findByEmail(email.value);
      if (existing && existing.id !== user.id) {
        throw new EmailAlreadyInUseError();
      }
      user.changeEmail(email);
    }

    if (input.username) {
      const username = Username.create(input.username);
      const existing = await this.userRepo.findByUsername(username.value);
      if (existing && existing.id !== user.id) {
        throw new UsernameAlreadyTakenError();
      }
      user.changeUsername(username);
    }

    await this.userRepo.update(user);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
