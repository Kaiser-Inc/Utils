import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { settings } from "./settings.js";
import * as schema from "../repositories/drizzle/schema.js";

export const pool = new Pool({
  host: settings.DB_HOST,
  port: settings.DB_PORT,
  database: settings.DB_NAME,
  user: settings.DB_USER,
  password: settings.DB_PASSWORD,
});

export const db = drizzle(pool, { schema });

export type Database = typeof db;
