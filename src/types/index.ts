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
}

export interface LessonExercise {
  title: string;
  description: string;
  starterCode: string;
  expectedHint: string;
}

export interface Lesson {
  id: string;
  courseSlug: string;
  slug: string;
  title: string;
  order: number;
  content: string;
  durationMinutes: number;
  codeExample: LessonCodeExample;
  keyPoints: string[];
  exercise: LessonExercise;
}

export interface Exercise {
  id: string;
  slug: string;
  title: string;
  description: string;
  language: CourseLanguage;
  level: CourseLevel;
  starterCode: string;
  expectedOutput?: string;
}
