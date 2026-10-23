// Idempotent content seed: courses, lessons and exercises come from the
// typed content files (single source of truth for the frontend) and are
// upserted by slug, so re-running never duplicates and never breaks
// slug-referenced progress rows.
import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { courses as contentCourses } from "@/content/courses/courses";
import { exercisesOf, lessonExercises, lessonsByCourse } from "@/content/courses";
import * as schema from "./schema";

type Db = BetterSQLite3Database<typeof schema>;

export function seedContent(db: Db) {
  for (const course of contentCourses) {
    db.insert(schema.courses)
      .values({
        slug: course.slug,
        title: course.title,
        description: course.description,
        language: course.language,
        level: course.level,
        published: course.published,
      })
      .onConflictDoUpdate({
        target: schema.courses.slug,
        set: {
          title: course.title,
          description: course.description,
          language: course.language,
          level: course.level,
          published: course.published,
        },
      })
      .run();
  }

  for (const [courseSlug, lessons] of Object.entries(lessonsByCourse)) {
    const courseRow = db.select().from(schema.courses).where(eq(schema.courses.slug, courseSlug)).get();
    if (!courseRow) continue;

    for (const lesson of lessons) {
      db.insert(schema.lessons)
        .values({
          courseId: courseRow.id,
          slug: lesson.slug,
          title: lesson.title,
          orderIndex: lesson.order,
          durationMinutes: lesson.durationMinutes,
          content: lesson.content,
          codeExample: JSON.stringify(lesson.codeExample),
          keyPoints: JSON.stringify(lesson.keyPoints),
          exercise: JSON.stringify(exercisesOf(lesson)),
        })
        .onConflictDoUpdate({
          target: [schema.lessons.courseId, schema.lessons.slug],
          set: {
            title: lesson.title,
            orderIndex: lesson.order,
            durationMinutes: lesson.durationMinutes,
            content: lesson.content,
            codeExample: JSON.stringify(lesson.codeExample),
            keyPoints: JSON.stringify(lesson.keyPoints),
            exercise: JSON.stringify(exercisesOf(lesson)),
          },
        })
        .run();
    }
  }

  for (const exercise of lessonExercises) {
    const courseRow = db.select().from(schema.courses).where(eq(schema.courses.slug, exercise.courseSlug)).get();
    if (!courseRow) continue;
    const lessonRow = db
      .select()
      .from(schema.lessons)
      .where(eq(schema.lessons.courseId, courseRow.id))
      .all()
      .find((l) => l.slug === exercise.lessonSlug);

    db.insert(schema.exercises)
      .values({
        courseId: courseRow.id,
        lessonId: lessonRow?.id ?? null,
        slug: exercise.slug,
        title: exercise.title,
        description: exercise.description,
        language: exercise.language,
        level: exercise.level,
        starterCode: exercise.starterCode,
        expectedHint: exercise.expectedHint,
      })
      .onConflictDoUpdate({
        target: schema.exercises.slug,
        set: {
          courseId: courseRow.id,
          lessonId: lessonRow?.id ?? null,
          title: exercise.title,
          description: exercise.description,
          language: exercise.language,
          level: exercise.level,
          starterCode: exercise.starterCode,
          expectedHint: exercise.expectedHint,
        },
      })
      .run();
  }
}
