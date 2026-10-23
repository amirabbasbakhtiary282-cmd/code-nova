// Aggregated course content: the fully re-authored HTML course lives in
// html-basics.ts while the legacy CSS/JS courses (pending their own rewrite
// in later content stages) stay in lessons.ts. Everything consumers need is
// re-exported from here so imports point at "@/content/courses" only.
import type { Lesson, LessonExercise } from "@/types";
import { htmlBasicsLessons } from "./html-basics";
import { lessonsByCourse as legacyLessonsByCourse } from "./lessons";

export const lessonsByCourse: Record<string, Lesson[]> = {
  "html-basics": htmlBasicsLessons,
  ...legacyLessonsByCourse,
};

export { htmlBasicsLessons };
export type { Lesson };

/** Normalized exercise list: new lessons carry `exercises`, legacy ones a single `exercise`. */
export function exercisesOf(lesson: Lesson): LessonExercise[] {
  return lesson.exercises ?? (lesson.exercise ? [lesson.exercise] : []);
}

/**
 * Stable exercise slug shared by the lesson view, /lab and the seed:
 * index 0 keeps the historical `${courseSlug}-${lessonSlug}` form (so saved
 * progress and existing links survive), later exercises get `-2`, `-3`, ...
 */
export function exerciseSlugFor(courseSlug: string, lessonSlug: string, index: number): string {
  return index === 0 ? `${courseSlug}-${lessonSlug}` : `${courseSlug}-${lessonSlug}-${index + 1}`;
}

export interface LessonExerciseItem {
  id: string;
  courseSlug: string;
  lessonSlug: string;
  slug: string;
  title: string;
  description: string;
  language: "html" | "css" | "javascript";
  level: "beginner" | "intermediate" | "advanced";
  starterCode: string;
  expectedHint: string;
  hint?: string;
  difficulty?: "easy" | "challenge";
}

export const lessonExercises: LessonExerciseItem[] = Object.entries(lessonsByCourse).flatMap(
  ([courseSlug, lessons]) =>
    lessons.flatMap((lesson) =>
      exercisesOf(lesson).map((exercise, index) => {
        const slug = exerciseSlugFor(courseSlug, lesson.slug, index);
        return {
          id: `${slug}-exercise`,
          courseSlug,
          lessonSlug: lesson.slug,
          slug,
          title: exercise.title,
          description: exercise.description,
          language: lesson.codeExample.language,
          level: courseSlug === "js-intro" ? "intermediate" : "beginner",
          starterCode: exercise.starterCode,
          expectedHint: exercise.expectedHint,
          hint: exercise.hint,
          difficulty: exercise.difficulty,
        } satisfies LessonExerciseItem;
      }),
    ),
);
