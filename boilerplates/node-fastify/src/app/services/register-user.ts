import { randomUUID } from "node:crypto";
import { hashPassword } from "../core/security.js";
import { EmailAlreadyInUseError, UsernameAlreadyTakenError } from "../domain/errors.js";
import { User } from "../domain/user.js";
import { Email } from "../domain/value-objects/email.js";
import { Username } from "../domain/value-objects/username.js";
import type { UserRepository } from "../repositories/user-repository.js";

export interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
}

export interface RegisterUserOutput {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
}

export class RegisterUserService {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = Email.create(input.email);
    const username = Username.create(input.username);

    const existingEmail = await this.userRepo.findByEmail(email.value);
    if (existingEmail) {
      throw new EmailAlreadyInUseError();
    }

    const existingUsername = await this.userRepo.findByUsername(username.value);
    if (existingUsername) {
      throw new UsernameAlreadyTakenError();
    }

    const hashedPassword = await hashPassword(input.password);

    const user = User.create({
      id: randomUUID(),
      username: username.value,
      email: email.value,
      hashedPassword,
    });

    await this.userRepo.save(user);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
