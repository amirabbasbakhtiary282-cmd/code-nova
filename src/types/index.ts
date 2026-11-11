export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseLanguage = "html" | "css" | "javascript";

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  language: CourseLanguage;
  level: CourseLevel;
  lessonCount: number;
  durationMinutes: number;
  published: boolean;
}

export interface LessonCodeExample {
  language: CourseLanguage;
  code: string;
  outputPreview?: string;
  /** Short Persian caption shown above the example (e.g. «مثال ساده»). */
  caption?: string;
}

/** One practical exercise attached to a lesson (a lesson has ≥2 in the new standard). */
export interface LessonExercise {
  title: string;
  description: string;
  starterCode: string;
  expectedHint: string;
  /** A nudge toward the solution — never the full answer. */
  hint?: string;
  /** easy = concept repetition, challenge = combines with previous lessons. */
  difficulty?: "easy" | "challenge";
}

/** A common beginner mistake: what it is, why it's wrong, how to fix it. */
export interface CommonMistake {
  mistake: string;
  why: string;
  fix: string;
}

export interface Lesson {
  id: string;
  courseSlug: string;
  slug: string;
  title: string;
  order: number;
  durationMinutes: number;

  /** «چرا این موضوع را یاد می‌گیریم؟» — one real-world motivated paragraph. */
  whyItMatters?: string;
  /** «قبل از این درس باید بدانی...» — omitted/empty for the very first lesson. */
  prerequisites?: string;

  /** Main teaching body: ≥4 real paragraphs, Markdown (**bold** for new terms). */
  content: string;

  /** Simple worked example (5–10 lines), runnable in /lab. */
  codeExample: LessonCodeExample;
  /** Intermediate example building on the simple one. */
  secondCodeExample?: LessonCodeExample;

  /** ≥3 beginner mistakes with cause and fix. */
  mistakes?: CommonMistake[];
  /** ≥4 complete-sentence takeaways. */
  keyPoints: string[];

  /** New standard: ≥2 exercises (easy + challenge). */
  exercises?: LessonExercise[];
  /** Legacy single exercise (CSS/JS courses until they are upgraded). */
  exercise?: LessonExercise;

  /** 2–3 sentence wrap-up. */
  summary?: string;
  /** «در درس بعد چه یاد می‌گیری؟» */
  nextLessonHint?: string;
  /** 2–3 hints for when the learner is stuck. */
  stuckHints?: string[];
  /** Slug of a related earlier lesson, linked in the «اگر گیر کردی» box. */
  relatedLessonSlug?: string;
}
