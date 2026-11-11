// Prisma ORM 7 project configuration (production MySQL path).
// Recognized by the Prisma 7 CLI (pinned: prisma@7.10.1 in devDependencies).
// NOTE: Prisma engines download from binaries.prisma.sh — commands like
// `prisma generate` / `prisma migrate dev` require network access to that
// host, which the sandboxed preview environment does not have. Run them on
// your own machine (see prisma/README.md).
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
