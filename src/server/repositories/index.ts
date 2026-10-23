// Repository factory — the single seam where the storage driver is chosen.
// Today: SQLite (better-sqlite3 + Drizzle), fully live in dev/preview.
// Production path: Prisma + MySQL — see prisma/schema.prisma and
// prisma/README.md (reference implementation in prisma/reference/).
import type { AppRepositories } from "./types";
import { createSqliteRepositories } from "./sqlite";

export * from "./types";
export { RepositoryNotFoundError } from "./sqlite";

const globalForRepos = globalThis as typeof globalThis & {
  __codenovaRepos?: AppRepositories;
};

export function getRepositories(): AppRepositories {
  if (!globalForRepos.__codenovaRepos) {
    globalForRepos.__codenovaRepos = createSqliteRepositories();
  }
  return globalForRepos.__codenovaRepos;
}
