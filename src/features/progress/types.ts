export interface LessonProgress {
  courseSlug: string;
  lessonSlug: string;
  completed: boolean;
  completedAt?: string;
}

export interface ExerciseProgress {
  exerciseSlug: string;
  completed: boolean;
  completedAt?: string;
}

export interface UserProgress {
  lessons: Record<string, LessonProgress>;
  exercises: Record<string, ExerciseProgress>;
  learningDays: string[];
  updatedAt?: string;
}

export interface CourseProgress {
  courseSlug: string;
  completedLessons: number;
  totalLessons: number;
  percent: number;
}
