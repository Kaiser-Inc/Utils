import { setupTelemetry } from "./app/core/telemetry.js";

setupTelemetry();

import { db, pool } from "./app/core/database.js";
import { createServer } from "./app/core/server.js";
import { settings } from "./app/core/settings.js";
import { DrizzleRefreshTokenRepository } from "./app/repositories/drizzle/drizzle-refresh-token-repository.js";
import { DrizzleUserRepository } from "./app/repositories/drizzle/drizzle-user-repository.js";

async function bootstrap(): Promise<void> {
  const userRepo = new DrizzleUserRepository(db);
  const refreshTokenRepo = new DrizzleRefreshTokenRepository(db);

  const server = await createServer({ userRepo, refreshTokenRepo });

  try {
    await server.listen({ port: settings.PORT, host: "0.0.0.0" });
    console.log(`Server running on port ${settings.PORT}`);
  } catch (err) {
    server.log.error(err);
    await pool.end();
    process.exit(1);
  }
}

bootstrap();
