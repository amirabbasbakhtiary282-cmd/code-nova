// Canonical data model — Drizzle ORM, SQLite dialect (live dev/preview DB).
// The production MySQL path is defined in prisma/schema.prisma with the SAME
// logical models; both are accessed through the repository interfaces in
// src/server/repositories/types.ts so UI code never depends on the driver.
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const userRoles = sqliteTable(
  "user_roles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("learner"), // 'learner' | 'mentor' | 'admin'
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [uniqueIndex("user_roles_user_role_idx").on(t.userId, t.role)],
);

export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  language: text("language").notNull(),
  level: text("level").notNull(),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const lessons = sqliteTable(
  "lessons",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    orderIndex: integer("order_index").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    content: text("content").notNull(),
    codeExample: text("code_example").notNull(), // JSON: {language, code, outputPreview?}
    keyPoints: text("key_points").notNull(), // JSON: string[]
    exercise: text("exercise").notNull(), // JSON: LessonExercise[] (normalized array; legacy single exercise stored as [exercise])
  },
  (t) => [uniqueIndex("lessons_course_slug_idx").on(t.courseId, t.slug)],
);

export const exercises = sqliteTable(
  "exercises",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    language: text("language").notNull(),
    level: text("level").notNull(),
    starterCode: text("starter_code").notNull(),
    expectedHint: text("expected_hint").notNull(),
  },
  (t) => [uniqueIndex("exercises_slug_idx").on(t.slug)],
);

export const enrollments = sqliteTable(
  "enrollments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    enrolledAt: integer("enrolled_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [uniqueIndex("enrollments_user_course_idx").on(t.userId, t.courseId)],
);

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    courseSlug: text("course_slug").notNull(), // denormalized for stable, readable queries
    lessonSlug: text("lesson_slug").notNull(),
    completedAt: integer("completed_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [uniqueIndex("lesson_progress_user_lesson_idx").on(t.userId, t.lessonId)],
);

export const submissions = sqliteTable(
  "submissions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    exerciseSlug: text("exercise_slug").notNull(),
    code: text("code").notNull().default(""), // JSON of editor buffers at solve time
    status: text("status").notNull().default("pass"), // 'pass' | 'fail' | 'saved'
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [uniqueIndex("submissions_user_exercise_idx").on(t.userId, t.exerciseId)],
);

export const quizAttempts = sqliteTable(
  "quiz_attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    total: integer("total").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [uniqueIndex("quiz_attempts_user_lesson_idx").on(t.userId, t.lessonId)],
);

export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  meta: text("meta"), // JSON
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export type UserRow = typeof users.$inferSelect;
export type CourseRow = typeof courses.$inferSelect;
export type LessonRow = typeof lessons.$inferSelect;
export type ExerciseRow = typeof exercises.$inferSelect;
export type LessonProgressRow = typeof lessonProgress.$inferSelect;
export type SubmissionRow = typeof submissions.$inferSelect;
export type AuditLogRow = typeof auditLogs.$inferSelect;
