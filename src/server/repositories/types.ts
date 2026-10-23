// Repository interfaces — the ONLY data contract the app (UI, server actions,
// route handlers, auth) depends on. Swapping SQLite → Prisma/MySQL means
// providing a different implementation of these interfaces; nothing above
// this layer changes. See prisma/README.md for the production switch guide.

/** Mirrors the client-side UserProgress shape (src/features/progress/types.ts). */
export interface ProgressSnapshotDTO {
  lessons: Record<
    string,
    { courseSlug: string; lessonSlug: string; completed: true; completedAt: string }
  >;
  exercises: Record<
    string,
    { exerciseSlug: string; completed: true; completedAt: string }
  >;
  learningDays: string[];
  updatedAt?: string;
}

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface PublicUser {
  id: number;
  name: string;
  email: string;
}

export interface UserRepository {
  createUser(input: { name: string; email: string; passwordHash: string }): Promise<UserRecord>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: number): Promise<UserRecord | null>;
}

export interface ProgressRepository {
  /** Full progress snapshot for a user (empty snapshot when nothing stored). */
  getSnapshot(userId: number): Promise<ProgressSnapshotDTO>;
  /** Marks a lesson complete; auto-enrolls the user in the course. */
  markLessonComplete(userId: number, courseSlug: string, lessonSlug: string): Promise<void>;
  /** Records a solved exercise submission. */
  markExerciseComplete(userId: number, exerciseSlug: string, code?: string): Promise<void>;
  /**
   * Idempotently merges a client snapshot (e.g. a guest's localStorage data)
   * into the DB and returns the resulting authoritative snapshot.
   */
  mergeSnapshot(userId: number, snapshot: ProgressSnapshotDTO): Promise<ProgressSnapshotDTO>;
}

export interface AuditRepository {
  log(userId: number | null, action: string, meta?: Record<string, unknown>): Promise<void>;
}

export interface AppRepositories {
  users: UserRepository;
  progress: ProgressRepository;
  audit: AuditRepository;
}
