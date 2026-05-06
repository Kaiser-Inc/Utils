import { Role } from "./role.js";
import type { Email } from "./value-objects/email.js";
import type { Username } from "./value-objects/username.js";

export interface CreateUserProps {
  id: string;
  username: string;
  email: string;
  hashedPassword: string;
  role?: Role;
  createdAt?: Date;
}

export interface ReconstituteUserProps {
  id: string;
  username: string;
  email: string;
  hashedPassword: string;
  role: string;
  createdAt: Date;
}

export class User {
  private constructor(
    public readonly id: string,
    private _username: string,
    private _email: string,
    private _hashedPassword: string,
    private _role: Role,
    public readonly createdAt: Date,
  ) {}

  static create(props: CreateUserProps): User {
    return new User(
      props.id,
      props.username,
      props.email,
      props.hashedPassword,
      props.role ?? Role.USER,
      props.createdAt ?? new Date(),
    );
  }

  static reconstitute(props: ReconstituteUserProps): User {
    const role = props.role === Role.ADMIN ? Role.ADMIN : Role.USER;
    return new User(props.id, props.username, props.email, props.hashedPassword, role, props.createdAt);
  }

  get username(): string {
    return this._username;
  }

  get email(): string {
    return this._email;
  }

  get hashedPassword(): string {
    return this._hashedPassword;
  }

  get role(): Role {
    return this._role;
  }

  changeEmail(email: Email): void {
    this._email = email.value;
  }

  changeUsername(username: Username): void {
    this._username = username.value;
  }

  promoteToAdmin(): void {
    this._role = Role.ADMIN;
  }

  demoteToUser(): void {
    this._role = Role.USER;
  }

  isAdmin(): boolean {
    return this._role === Role.ADMIN;
  }

  toJSON() {
    return {
      id: this.id,
      username: this._username,
      email: this._email,
      role: this._role,
      createdAt: this.createdAt,
    };
  }
}
