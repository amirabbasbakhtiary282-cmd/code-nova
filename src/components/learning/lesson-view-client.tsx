"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { AlertTriangle, CheckCircle2, Compass, HelpCircle, Lightbulb, ListChecks, Sparkles } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { exercisesOf, exerciseSlugFor } from "@/content/courses";
import { useCourseProgress, useLessonProgress } from "@/features/progress/hooks";
import type { Lesson, LessonCodeExample, LessonExercise } from "@/types";

interface LessonViewClientProps {
  courseSlug: string;
  courseTitle: string;
  lesson: Lesson;
  allLessons: Lesson[];
  nextLessonSlug?: string;
}

function buildPreviewDoc(example: LessonCodeExample) {
  if (example.language === "html") {
    return example.outputPreview ?? example.code;
  }
  if (example.language === "css") {
    return `<!doctype html><html><head><style>${example.code}</style></head><body><div class='card'>نمونه خروجی CSS</div><h2>عنوان نمونه</h2><p>این متن برای مشاهده استایل است.</p></body></html>`;
  }

  const safeCode = example.code.replace(/<\/script>/gi, "<\\/script>");
  return `<!doctype html><html><body><h3>خروجی JavaScript</h3><pre id='out'></pre><script>const oldLog = console.log;console.log=(...args)=>{document.getElementById('out').textContent += args.join(' ') + '\\n';oldLog(...args);};${safeCode}</script></body></html>`;
}

/** Read-only code + live output for one worked example (simple or intermediate). */
function CodeExampleCard({ example, lessonSlug, fallbackTitle }: { example: LessonCodeExample; lessonSlug: string; fallbackTitle: string }) {
  const previewDoc = useMemo(() => buildPreviewDoc(example), [example]);
  const [runId, setRunId] = useState(0);
  const languageLabel = example.language.toUpperCase();

  return (
    <Card className="mt-8 border-white/10 bg-surface/75">
      <div className="flex flex-wrap items-center gap-2">
        <CardTitle>{example.caption ?? fallbackTitle}</CardTitle>
        <Badge variant="neutral">{languageLabel}</Badge>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="h-72 overflow-hidden rounded-lg border border-white/10" dir="ltr">
          <Editor
            language={example.language === "javascript" ? "javascript" : example.language}
            value={example.code}
            theme="vs-dark"
            options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, fontFamily: "var(--font-mono)" }}
          />
        </div>
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white">
          <div className="flex items-center justify-between border-b border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-700" dir="ltr">
            <span>Output</span>
            <Button size="sm" variant="outline" onClick={() => setRunId((id) => id + 1)}>
              اجرا
            </Button>
          </div>
          <iframe key={runId} title={`preview-${lessonSlug}-${runId}`} className="h-60 w-full" sandbox="allow-scripts" srcDoc={previewDoc} />
        </div>
      </div>
    </Card>
  );
}

/** One exercise block: problem, starter code, expected-output hint and a nudge (never the answer). */
function ExerciseBlock({ exercise, index, courseSlug, lessonSlug }: { exercise: LessonExercise; index: number; courseSlug: string; lessonSlug: string }) {
  const labSlug = exerciseSlugFor(courseSlug, lessonSlug, index);
  const isChallenge = exercise.difficulty === "challenge";

  return (
    <div className="rounded-lg border border-white/10 bg-surface-elevated/60 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={isChallenge ? "warning" : "info"}>{isChallenge ? "چالش ترکیبی" : "تمرین ساده"}</Badge>
        <h4 className="text-sm font-bold text-foreground">{exercise.title}</h4>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{exercise.description}</p>
      {exercise.starterCode ? (
        <div className="mt-3 rounded-lg border border-white/10 bg-slate-950 p-3 text-xs text-emerald-300" dir="ltr">
          <pre className="overflow-x-auto whitespace-pre-wrap">{exercise.starterCode}</pre>
        </div>
      ) : null}
      <p className="mt-2 text-xs text-info">خروجی مورد انتظار: {exercise.expectedHint}</p>
      {exercise.hint ? <p className="mt-1 text-xs text-warning">راهنمایی (نه جواب کامل!): {exercise.hint}</p> : null}
      <Link href={`/lab?exercise=${labSlug}`} className="mt-3 inline-block text-sm text-primary">
        حل تمرین در آزمایشگاه ←
      </Link>
    </div>
  );
}

export function LessonViewClient({ courseSlug, courseTitle, lesson, allLessons, nextLessonSlug }: LessonViewClientProps) {
  const lessonProgress = useLessonProgress(courseSlug, lesson.slug);
  const courseProgress = useCourseProgress(
    courseSlug,
    allLessons.map((item) => item.slug),
  );
  const exercises = useMemo(() => exercisesOf(lesson), [lesson]);
  const relatedLesson = useMemo(
    () => (lesson.relatedLessonSlug ? allLessons.find((item) => item.slug === lesson.relatedLessonSlug) : undefined),
    [allLessons, lesson.relatedLessonSlug],
  );
  const nextLesson = useMemo(
    () => (nextLessonSlug ? allLessons.find((item) => item.slug === nextLessonSlug) : undefined),
    [allLessons, nextLessonSlug],
  );

  return (
    <motion.main initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl px-4 py-16">
      <Breadcrumb
        items={[
          { href: "/courses", label: "دوره‌ها" },
          { href: `/courses/${courseSlug}`, label: courseTitle },
          { label: lesson.title },
        ]}
      />

      <div className="mb-6 rounded-xl border border-white/10 bg-surface/70 p-4">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>پیشرفت دوره</span>
          <span>{courseProgress.percent}%</span>
        </div>
        <Progress value={courseProgress.percent} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">
          {lesson.title}
          <span className="mr-2 text-sm font-normal text-muted-foreground">درس {lesson.order} • {lesson.durationMinutes} دقیقه</span>
        </h1>
        {lessonProgress.completed ? (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> قبلاً کامل شده
          </Badge>
        ) : (
          <Badge variant="info">در حال یادگیری</Badge>
        )}
      </div>

      {lesson.whyItMatters ? (
        <Card className="mt-6 border-info/30 bg-info/5">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-info" aria-hidden />
            چرا این درس را یاد می‌گیریم؟
          </CardTitle>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{lesson.whyItMatters}</p>
        </Card>
      ) : null}

      {lesson.prerequisites ? (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-white/10 bg-surface/60 p-3 text-xs leading-relaxed text-muted-foreground">
          <Compass className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          <span>پیش‌نیاز: {lesson.prerequisites}</span>
        </p>
      ) : null}

      <article className="prose prose-invert mt-6 max-w-none leading-relaxed text-muted-foreground">
        <ReactMarkdown>{lesson.content}</ReactMarkdown>
      </article>

      <CodeExampleCard example={lesson.codeExample} lessonSlug={lesson.slug} fallbackTitle={`مثال کد (${lesson.codeExample.language.toUpperCase()})`} />
      {lesson.secondCodeExample ? (
        <CodeExampleCard example={lesson.secondCodeExample} lessonSlug={`${lesson.slug}-b`} fallbackTitle="مثال متوسط" />
      ) : null}

      {lesson.mistakes && lesson.mistakes.length > 0 ? (
        <Card className="mt-8 border-error/25 bg-surface/75">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-error" aria-hidden />
            اشتباهات رایج
          </CardTitle>
          <div className="mt-4 space-y-3">
            {lesson.mistakes.map((item) => (
              <div key={item.mistake} className="rounded-lg border border-white/10 bg-surface-elevated p-3">
                <p className="text-sm font-semibold text-foreground">{item.mistake}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  <span className="text-error">چرا اشتباه است؟</span> {item.why}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  <span className="text-success">راه‌حل:</span> {item.fix}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="mt-8 border-white/10 bg-surface/75">
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" aria-hidden />
          نکات کلیدی
        </CardTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {lesson.keyPoints.map((point) => (
            <div key={point} className="rounded-lg border border-white/10 bg-surface-elevated p-3 text-sm text-muted-foreground">
              {point}
            </div>
          ))}
        </div>
      </Card>

      {exercises.length > 0 ? (
        <Card className="mt-8 border-white/10 bg-surface/75">
          <CardTitle>تمرین‌های درس ({exercises.length})</CardTitle>
          <p className="mt-2 text-xs text-muted-foreground">
            اول تمرین ساده را حل کن، بعد سراغ چالش برو. راهنمایی‌ها عمداً جواب کامل نمی‌دهند — خودت کد را بساز و در آزمایشگاه اجرا کن.
          </p>
          <div className="mt-4 space-y-4">
            {exercises.map((exercise, index) => (
              <ExerciseBlock key={exerciseSlugFor(courseSlug, lesson.slug, index)} exercise={exercise} index={index} courseSlug={courseSlug} lessonSlug={lesson.slug} />
            ))}
          </div>
        </Card>
      ) : null}

      {lesson.summary ? (
        <Card className="mt-8 border-success/25 bg-success/5">
          <CardTitle>جمع‌بندی درس</CardTitle>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{lesson.summary}</p>
          {lesson.nextLessonHint ? (
            <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-relaxed text-info">
              در درس بعد{nextLesson ? ` («${nextLesson.title}»)` : ""}: {lesson.nextLessonHint}
            </p>
          ) : null}
        </Card>
      ) : null}

      {lesson.stuckHints && lesson.stuckHints.length > 0 ? (
        <Card className="mt-8 border-warning/25 bg-warning/5">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-warning" aria-hidden />
            اگر گیر کردی
          </CardTitle>
          <ul className="mt-3 list-disc space-y-2 pr-5 text-sm leading-relaxed text-muted-foreground">
            {lesson.stuckHints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
          {relatedLesson ? (
            <Link href={`/learn/${courseSlug}/${relatedLesson.slug}`} className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
              <Lightbulb className="h-3.5 w-3.5" aria-hidden />
              مرور درس مرتبط: {relatedLesson.title}
            </Link>
          ) : null}
        </Card>
      ) : null}

      {!lessonProgress.completed ? (
        <Alert variant="warning" className="mt-6">
          برای فعال شدن درس بعدی، این درس را کامل‌شده علامت بزن.
        </Alert>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={lessonProgress.markComplete} disabled={lessonProgress.completed}>
            {lessonProgress.completed ? "این درس کامل شده" : "این درس را کامل کردم"}
          </Button>
          <Link href={`/courses/${courseSlug}`}>
            <Button variant="ghost">بازگشت به دوره</Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {nextLessonSlug ? (
            lessonProgress.completed ? (
              <Link href={`/learn/${courseSlug}/${nextLessonSlug}`}>
                <Button>درس بعدی</Button>
              </Link>
            ) : (
              <Button disabled title="ابتدا این درس را کامل کن">
                درس بعدی
              </Button>
            )
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="success">پایان این دوره</Badge>
              <Link href={`/courses/${courseSlug}`}>
                <Button variant="outline">بازگشت به دوره</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.main>
  );
}
