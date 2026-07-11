import { existsSync } from "node:fs";
import { join } from "node:path";
import { app } from "electron";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "@/db";

/**
 * Finds and applies the migrations folder both in dev and inside the packaged
 * .app. In the packaged app the folder is copied as an extraResource under
 * `process.resourcesPath/db/migrations` (see electron-builder.yml).
 */
export function runMigrations(): void {
  const candidates = [
    join(process.cwd(), "db", "migrations"),
    join(app.getAppPath(), "db", "migrations"),
    join(process.resourcesPath ?? "", "db", "migrations"),
  ];
  const folder = candidates.find((p) => existsSync(p));
  if (!folder) {
    console.error("Migrations folder not found:", candidates);
    return;
  }
  migrate(db, { migrationsFolder: folder });
  console.log("Migrations applied:", folder);
}
