import { eq } from "drizzle-orm";
import type { Database } from "../../core/database.js";
import { User } from "../../domain/user.js";
import type { UserRepository } from "../user-repository.js";
import { users } from "./schema.js";

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<User | null> {
    const rows = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    if (rows.length === 0) return null;
    return this.toEntity(rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (rows.length === 0) return null;
    return this.toEntity(rows[0]);
  }

  async findByUsername(username: string): Promise<User | null> {
    const rows = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    if (rows.length === 0) return null;
    return this.toEntity(rows[0]);
  }

  async save(user: User): Promise<void> {
    await this.db.insert(users).values({
      id: user.id,
      username: user.username,
      email: user.email,
      hashedPassword: user.hashedPassword,
      role: user.role,
      createdAt: user.createdAt,
    });
  }

  async update(user: User): Promise<void> {
    await this.db
      .update(users)
      .set({
        username: user.username,
        email: user.email,
        hashedPassword: user.hashedPassword,
        role: user.role,
      })
      .where(eq(users.id, user.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }

  private toEntity(row: typeof users.$inferSelect): User {
    return User.reconstitute({
      id: row.id,
      username: row.username,
      email: row.email,
      hashedPassword: row.hashedPassword,
      role: row.role,
      createdAt: row.createdAt,
    });
  }
}
