"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { CheckCircle2 } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCourseProgress, useLessonProgress } from "@/features/progress/hooks";
import type { Lesson } from "@/types";

interface LessonViewClientProps {
  courseSlug: string;
  lesson: Lesson;
  allLessons: Lesson[];
  nextLessonSlug?: string;
}

function buildPreviewDoc(lesson: Lesson) {
  if (lesson.codeExample.language === "html") {
    return lesson.codeExample.outputPreview ?? lesson.codeExample.code;
  }
  if (lesson.codeExample.language === "css") {
    return `<!doctype html><html><head><style>${lesson.codeExample.code}</style></head><body><div class='card'>نمونه خروجی CSS</div><h2>عنوان نمونه</h2><p>این متن برای مشاهده استایل است.</p></body></html>`;
  }

  const safeCode = lesson.codeExample.code.replace(/<\/script>/gi, "<\\/script>");
  return `<!doctype html><html><body><h3>خروجی JavaScript</h3><pre id='out'></pre><script>const oldLog = console.log;console.log=(...args)=>{document.getElementById('out').textContent += args.join(' ') + '\n';oldLog(...args);};${safeCode}</script></body></html>`;
}

export function LessonViewClient({ courseSlug, lesson, allLessons, nextLessonSlug }: LessonViewClientProps) {
  const lessonProgress = useLessonProgress(courseSlug, lesson.slug);
  const courseProgress = useCourseProgress(
    courseSlug,
    allLessons.map((item) => item.slug),
  );
  const [previewDoc, setPreviewDoc] = useState<string>(buildPreviewDoc(lesson));

  const languageLabel = useMemo(() => lesson.codeExample.language.toUpperCase(), [lesson.codeExample.language]);

  return (
    <motion.main initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl px-4 py-16">
      <Breadcrumb
        items={[
          { href: "/courses", label: "دوره‌ها" },
          { href: `/courses/${courseSlug}`, label: courseSlug },
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
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        {lessonProgress.completed ? (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> قبلاً کامل شده
          </Badge>
        ) : (
          <Badge variant="info">در حال یادگیری</Badge>
        )}
      </div>

      <article className="prose prose-invert mt-6 max-w-none leading-relaxed text-muted-foreground">
        <ReactMarkdown>{lesson.content}</ReactMarkdown>
      </article>

      <Card className="mt-8 border-white/10 bg-surface/75">
        <CardTitle>مثال کد ({languageLabel})</CardTitle>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="h-72 overflow-hidden rounded-lg border border-white/10" dir="ltr">
            <Editor
              language={lesson.codeExample.language === "javascript" ? "javascript" : lesson.codeExample.language}
              value={lesson.codeExample.code}
              theme="vs-dark"
              options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, fontFamily: "var(--font-mono)" }}
            />
          </div>
          <div className="overflow-hidden rounded-lg border border-white/10 bg-white">
            <div className="flex items-center justify-between border-b border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-700" dir="ltr">
              <span>Output</span>
              <Button size="sm" variant="outline" onClick={() => setPreviewDoc(buildPreviewDoc(lesson))}>
                اجرا
              </Button>
            </div>
            <iframe title={`preview-${lesson.slug}`} className="h-60 w-full" sandbox="allow-scripts" srcDoc={previewDoc} />
          </div>
        </div>
      </Card>

      <Card className="mt-8 border-white/10 bg-surface/75">
        <CardTitle>نکات کلیدی</CardTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {lesson.keyPoints.map((point) => (
            <div key={point} className="rounded-lg border border-white/10 bg-surface-elevated p-3 text-sm text-muted-foreground">
              {point}
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-8 border-white/10 bg-surface/75">
        <CardTitle>تمرین کوچک: {lesson.exercise.title}</CardTitle>
        <p className="mt-3 text-sm text-muted-foreground">{lesson.exercise.description}</p>
        <div className="mt-3 rounded-lg border border-white/10 bg-slate-950 p-3 text-xs text-emerald-300 code-ltr">
          <pre>{lesson.exercise.starterCode}</pre>
        </div>
        <p className="mt-2 text-xs text-info">راهنما: {lesson.exercise.expectedHint}</p>
        <Link href={`/lab?exercise=${courseSlug}-${lesson.slug}`} className="mt-3 inline-block text-sm text-primary">
          حل تمرین در آزمایشگاه ←
        </Link>
      </Card>

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
            <Badge variant="success">پایان این دوره</Badge>
          )}
        </div>
      </div>
    </motion.main>
  );
}
