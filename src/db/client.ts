// Live application database — SQLite via better-sqlite3 + Drizzle.
// Chosen because the sandbox/preview environment cannot run a MySQL server;
// the production MySQL path lives in prisma/schema.prisma and is documented
// in prisma/README.md. All app code goes through the repository interfaces
// (src/server/repositories/types.ts), never through this driver directly.
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";
import { seedContent } from "./seed";

export type AppDb = BetterSQLite3Database<typeof schema>;

const globalForDb = globalThis as typeof globalThis & {
  __codenovaSqliteDb?: AppDb;
  __codenovaSeeded?: boolean;
};

function resolveDbFile(): string {
  return process.env.DB_FILE ?? path.join(process.cwd(), "data", "codenova.db");
}

export function getDbFile(): string {
  return resolveDbFile();
}

export function getDb(): AppDb {
  if (globalForDb.__codenovaSqliteDb) return globalForDb.__codenovaSqliteDb;

  const file = resolveDbFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });

  if (!globalForDb.__codenovaSeeded) {
    seedContent(db);
    globalForDb.__codenovaSeeded = true;
  }

  globalForDb.__codenovaSqliteDb = db;
  return db;
}
