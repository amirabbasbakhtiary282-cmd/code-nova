// REFERENCE — content seed for the Prisma/MySQL production path.
// Mirrors src/db/seed.ts (SQLite). Run on your machine after
// `npx prisma migrate dev` (e.g. copy to prisma/seed.ts and register it in
// prisma.config.ts under migrations.seed, or run with tsx).
import { PrismaClient } from "../../generated/prisma/client.js";
// After copying, use "@/content/courses/courses" and "@/content/courses/lessons":
import { courses as contentCourses } from "../../src/content/courses/courses";
import { lessonExercises, lessonsByCourse } from "../../src/content/courses/lessons";

const prisma = new PrismaClient();

async function main() {
  for (const course of contentCourses) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      create: {
        slug: course.slug,
        title: course.title,
        description: course.description,
        language: course.language,
        level: course.level,
        published: course.published,
      },
      update: {
        title: course.title,
        description: course.description,
        language: course.language,
        level: course.level,
        published: course.published,
      },
    });
  }

  for (const [courseSlug, lessons] of Object.entries(lessonsByCourse)) {
    const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
    if (!course) continue;

    for (const lesson of lessons) {
      await prisma.lesson.upsert({
        where: { courseId_slug: { courseId: course.id, slug: lesson.slug } },
        create: {
          courseId: course.id,
          slug: lesson.slug,
          title: lesson.title,
          order: lesson.order,
          durationMinutes: lesson.durationMinutes,
          content: lesson.content,
          codeExample: JSON.stringify(lesson.codeExample),
          keyPoints: JSON.stringify(lesson.keyPoints),
          exercise: JSON.stringify(lesson.exercise),
        },
        update: {
          title: lesson.title,
          order: lesson.order,
          durationMinutes: lesson.durationMinutes,
          content: lesson.content,
          codeExample: JSON.stringify(lesson.codeExample),
          keyPoints: JSON.stringify(lesson.keyPoints),
          exercise: JSON.stringify(lesson.exercise),
        },
      });
    }
  }

  for (const exercise of lessonExercises) {
    const course = await prisma.course.findUnique({ where: { slug: exercise.courseSlug } });
    if (!course) continue;
    const lesson = await prisma.lesson.findFirst({
      where: { courseId: course.id, slug: exercise.lessonSlug },
    });

    await prisma.exercise.upsert({
      where: { slug: exercise.slug },
      create: {
        courseId: course.id,
        lessonId: lesson?.id ?? null,
        slug: exercise.slug,
        title: exercise.title,
        description: exercise.description,
        language: exercise.language,
        level: exercise.level,
        starterCode: exercise.starterCode,
        expectedHint: exercise.expectedHint,
      },
      update: {
        courseId: course.id,
        lessonId: lesson?.id ?? null,
        title: exercise.title,
        description: exercise.description,
        language: exercise.language,
        level: exercise.level,
        starterCode: exercise.starterCode,
        expectedHint: exercise.expectedHint,
      },
    });
  }

  console.log("[prisma-seed] content seeded");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
