import {
  EmailAlreadyInUseError,
  UserNotFoundError,
  UsernameAlreadyTakenError,
} from "../domain/errors.js";
import type { Role } from "../domain/role.js";
import type { User } from "../domain/user.js";
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

// ─── Pure validation helpers (extracted to reduce CC in execute) ──────────────

async function applyEmailChange(
  user: User,
  rawEmail: string,
  userRepo: UserRepository,
): Promise<void> {
  const email = Email.create(rawEmail);
  const existing = await userRepo.findByEmail(email.value);
  if (existing && existing.id !== user.id) {
    throw new EmailAlreadyInUseError();
  }
  user.changeEmail(email);
}

async function applyUsernameChange(
  user: User,
  rawUsername: string,
  userRepo: UserRepository,
): Promise<void> {
  const username = Username.create(rawUsername);
  const existing = await userRepo.findByUsername(username.value);
  if (existing && existing.id !== user.id) {
    throw new UsernameAlreadyTakenError();
  }
  user.changeUsername(username);
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class UpdateUserService {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
    const user = await this.userRepo.findById(input.userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    if (input.email) {
      await applyEmailChange(user, input.email, this.userRepo);
    }

    if (input.username) {
      await applyUsernameChange(user, input.username, this.userRepo);
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
