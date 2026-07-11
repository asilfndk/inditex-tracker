import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const dbPath =
  process.env.DATABASE_URL?.replace(/^file:/, "") ?? "./data/app.db";

// Ensure the database folder exists
const dir = dirname(dbPath);
if (dir && dir !== "." && !existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

// Keep a single connection across Next.js dev hot-reloads
const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
};

const sqlite =
  globalForDb.sqlite ??
  (() => {
    const conn = new Database(dbPath);
    conn.pragma("journal_mode = WAL");
    conn.pragma("foreign_keys = ON");
    return conn;
  })();

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });
export { schema };
