import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/app/repositories/drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? "boilerplate",
    user: process.env.DB_USER ?? "docker",
    password: process.env.DB_PASSWORD ?? "docker",
    ssl: false,
  },
});
