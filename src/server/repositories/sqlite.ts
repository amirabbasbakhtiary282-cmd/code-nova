// SQLite implementation of the repository interfaces (live dev/preview DB).
// better-sqlite3 is synchronous; methods keep the async contract so the
// Prisma/MySQL implementation can be dropped in without touching callers.
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { localDayISO } from "@/lib/dates";
import type {
  AppRepositories,
  AuditRepository,
  ProgressRepository,
  ProgressSnapshotDTO,
  UserRecord,
  UserRepository,
} from "./types";

export class RepositoryNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryNotFoundError";
  }
}

const usersRepo: UserRepository = {
  async createUser(input) {
    const db = getDb();
    const result = db
      .insert(schema.users)
      .values({ name: input.name, email: input.email, passwordHash: input.passwordHash })
      .run();
    const id = Number(result.lastInsertRowid);
    db.insert(schema.userRoles).values({ userId: id, role: "learner" }).run();
    const row = db.select().from(schema.users).where(eq(schema.users.id, id)).get();
    if (!row) throw new RepositoryNotFoundError("user vanished after insert");
    return toUserRecord(row);
  },

  async findByEmail(email) {
    const row = getDb()
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase()))
      .get();
    return row ? toUserRecord(row) : null;
  },

  async findById(id) {
    const row = getDb().select().from(schema.users).where(eq(schema.users.id, id)).get();
    return row ? toUserRecord(row) : null;
  },
};

function toUserRecord(row: schema.UserRow): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
  };
}

const progressRepo: ProgressRepository = {
  async getSnapshot(userId) {
    const db = getDb();
    const lessonRows = db.select().from(schema.lessonProgress).where(eq(schema.lessonProgress.userId, userId)).all();
    const submissionRows = db.select().from(schema.submissions).where(eq(schema.submissions.userId, userId)).all();

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
      if (row.status !== "pass") continue;
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
    const db = getDb();
    const course = db.select().from(schema.courses).where(eq(schema.courses.slug, courseSlug)).get();
    if (!course) throw new RepositoryNotFoundError(`course not found: ${courseSlug}`);
    const lesson = db
      .select()
      .from(schema.lessons)
      .where(and(eq(schema.lessons.courseId, course.id), eq(schema.lessons.slug, lessonSlug)))
      .get();
    if (!lesson) throw new RepositoryNotFoundError(`lesson not found: ${courseSlug}/${lessonSlug}`);

    // Auto-enroll on first progress in a course (idempotent).
    db.insert(schema.enrollments)
      .values({ userId, courseId: course.id })
      .onConflictDoNothing()
      .run();

    db.insert(schema.lessonProgress)
      .values({ userId, lessonId: lesson.id, courseSlug, lessonSlug })
      .onConflictDoNothing()
      .run();
  },

  async markExerciseComplete(userId, exerciseSlug, code = "") {
    const db = getDb();
    const exercise = db.select().from(schema.exercises).where(eq(schema.exercises.slug, exerciseSlug)).get();
    if (!exercise) throw new RepositoryNotFoundError(`exercise not found: ${exerciseSlug}`);

    db.insert(schema.submissions)
      .values({ userId, exerciseId: exercise.id, exerciseSlug, code, status: "pass" })
      .onConflictDoUpdate({ target: [schema.submissions.userId, schema.submissions.exerciseId], set: { status: "pass", code } })
      .run();
  },

  async mergeSnapshot(userId, snapshot) {
    for (const item of Object.values(snapshot.lessons ?? {})) {
      try {
        await this.markLessonComplete(userId, item.courseSlug, item.lessonSlug);
      } catch (error) {
        // Stale/unknown slugs from an older content version are skipped, not fatal.
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
    getDb()
      .insert(schema.auditLogs)
      .values({ userId, action, meta: meta ? JSON.stringify(meta) : null })
      .run();
  },
};

export function createSqliteRepositories(): AppRepositories {
  return { users: usersRepo, progress: progressRepo, audit: auditRepo };
}
