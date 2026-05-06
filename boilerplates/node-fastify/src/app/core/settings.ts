import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default("boilerplate"),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  SECRET_KEY: z.string().min(32),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:4200"),
  OTLP_ENDPOINT: z.string().default("http://localhost:4317"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const settings = parsed.data;
