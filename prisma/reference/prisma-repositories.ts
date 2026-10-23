// REFERENCE IMPLEMENTATION — Prisma ORM 7 + MySQL (production path).
//
// This file is intentionally OUTSIDE the app's tsconfig/eslint scope because
// the generated Prisma client (`generated/prisma/client`) cannot be produced
// in network-restricted environments (Prisma engines download from
// binaries.prisma.sh). On a machine with MySQL + open network:
//
//   1. npx prisma migrate dev --name init     (creates tables + generates client)
//   2. copy this file to src/server/repositories/prisma.ts
//   3. fix the imports to the "@/..." alias (marked below)
//   4. point getRepositories() in src/server/repositories/index.ts at
//      createPrismaRepositories()
//
// It implements EXACTLY the same interfaces as the live SQLite driver, so no
// UI/action/route code changes are required.
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
// After copying into src/, use the "@/" alias for these two imports:
import { PrismaClient } from "../../generated/prisma/client.js";
import { localDayISO } from "../../src/lib/dates";
import type {
  AppRepositories,
  AuditRepository,
  ProgressRepository,
  ProgressSnapshotDTO,
  UserRecord,
  UserRepository,
} from "../../src/server/repositories/types";

const globalForPrisma = globalThis as typeof globalThis & { __codenovaPrisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (globalForPrisma.__codenovaPrisma) return globalForPrisma.__codenovaPrisma;

  const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") globalForPrisma.__codenovaPrisma = prisma;
  return prisma;
}

export class RepositoryNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryNotFoundError";
  }
}

const usersRepo: UserRepository = {
  async createUser(input) {
    const prisma = getPrisma();
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        roles: { create: { role: "learner" } },
      },
    });
    return toUserRecord(user);
  },

  async findByEmail(email) {
    const user = await getPrisma().user.findUnique({ where: { email: email.toLowerCase() } });
    return user ? toUserRecord(user) : null;
  },

  async findById(id) {
    const user = await getPrisma().user.findUnique({ where: { id } });
    return user ? toUserRecord(user) : null;
  },
};

function toUserRecord(user: { id: number; name: string; email: string; passwordHash: string; createdAt: Date }): UserRecord {
  return { id: user.id, name: user.name, email: user.email, passwordHash: user.passwordHash, createdAt: user.createdAt };
}

const progressRepo: ProgressRepository = {
  async getSnapshot(userId) {
    const prisma = getPrisma();
    const [lessonRows, submissionRows] = await Promise.all([
      prisma.lessonProgress.findMany({ where: { userId } }),
      prisma.submission.findMany({ where: { userId, status: "pass" } }),
    ]);

    const snapshot: ProgressSnapshotDTO = { lessons: {}, exercises: {}, learningDays: [] };
    const days = new Set<string>();

    for (const row of lessonRows) {
      snapshot.lessons[`${row.courseSlug}:${row.lessonSlug}`] = {
        courseSlug: row.courseSlug,
        lessonSlug: row.lessonSlug,
        completed: true,
        completedAt: row.completedAt.toISOString(),
      };
      days.add(localDayISO(row.completedAt));
    }
    for (const row of submissionRows) {
      snapshot.exercises[row.exerciseSlug] = {
        exerciseSlug: row.exerciseSlug,
        completed: true,
        completedAt: row.createdAt.toISOString(),
      };
      days.add(localDayISO(row.createdAt));
    }
    snapshot.learningDays = Array.from(days).sort();
    return snapshot;
  },

  async markLessonComplete(userId, courseSlug, lessonSlug) {
    const prisma = getPrisma();
    const lesson = await prisma.lesson.findFirst({
      where: { slug: lessonSlug, course: { slug: courseSlug } },
      include: { course: { select: { id: true } } },
    });
    if (!lesson) throw new RepositoryNotFoundError(`lesson not found: ${courseSlug}/${lessonSlug}`);

    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId: lesson.course.id } },
      create: { userId, courseId: lesson.course.id },
      update: {},
    });
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
      create: { userId, lessonId: lesson.id, courseSlug, lessonSlug },
      update: {},
    });
  },

  async markExerciseComplete(userId, exerciseSlug, code = "") {
    const prisma = getPrisma();
    const exercise = await prisma.exercise.findUnique({ where: { slug: exerciseSlug } });
    if (!exercise) throw new RepositoryNotFoundError(`exercise not found: ${exerciseSlug}`);

    await prisma.submission.upsert({
      where: { userId_exerciseId: { userId, exerciseId: exercise.id } },
      create: { userId, exerciseId: exercise.id, exerciseSlug, code, status: "pass" },
      update: { status: "pass", code },
    });
  },

  async mergeSnapshot(userId, snapshot) {
    for (const item of Object.values(snapshot.lessons ?? {})) {
      try {
        await this.markLessonComplete(userId, item.courseSlug, item.lessonSlug);
      } catch (error) {
        if (!(error instanceof RepositoryNotFoundError)) throw error;
      }
    }
    for (const item of Object.values(snapshot.exercises ?? {})) {
      try {
        await this.markExerciseComplete(userId, item.exerciseSlug);
      } catch (error) {
        if (!(error instanceof RepositoryNotFoundError)) throw error;
      }
    }
    return this.getSnapshot(userId);
  },
};

const auditRepo: AuditRepository = {
  async log(userId, action, meta) {
    await getPrisma().auditLog.create({
      data: { userId, action, meta: meta ? JSON.stringify(meta) : null },
    });
  },
};

export function createPrismaRepositories(): AppRepositories {
  return { users: usersRepo, progress: progressRepo, audit: auditRepo };
}
