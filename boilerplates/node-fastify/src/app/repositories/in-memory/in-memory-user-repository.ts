import type { User } from "../../domain/user.js";
import type { UserRepository } from "../user-repository.js";

export class InMemoryUserRepository implements UserRepository {
  public items: User[] = [];

  async findById(id: string): Promise<User | null> {
    return this.items.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((u) => u.email === email) ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.items.find((u) => u.username === username) ?? null;
  }

  async save(user: User): Promise<void> {
    this.items.push(user);
  }

  async update(user: User): Promise<void> {
    const index = this.items.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      this.items[index] = user;
    }
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((u) => u.id !== id);
  }
}
