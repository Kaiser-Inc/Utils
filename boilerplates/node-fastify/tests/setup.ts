import { config } from "dotenv";

// Load test environment variables before anything else
config({ path: ".env.test" });

// Ensure minimum required env vars for tests
process.env.DB_USER = process.env.DB_USER ?? "docker";
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? "docker";
process.env.SECRET_KEY =
  process.env.SECRET_KEY ?? "test-secret-key-minimum-32-chars-long!!";
process.env.REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ?? "test-refresh-secret-key-minimum-32-chars!";
process.env.NODE_ENV = "test";
