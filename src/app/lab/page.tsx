"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { lessonExercises } from "@/content/courses";
import { useExerciseProgress } from "@/features/progress/hooks";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="p-4 text-xs text-muted-foreground">در حال بارگذاری ادیتور...</div>,
});

type LabMode = "html" | "css" | "javascript" | "htmlcss";

interface CodeBuffers {
  html: string;
  css: string;
  js: string;
}

const defaultTemplates: Record<LabMode, CodeBuffers> = {
  html: {
    html: "<h1>سلام کدنوا</h1>\n<p>کد HTML خودت را بنویس.</p>",
    css: "body { font-family: sans-serif; }",
    js: "",
  },
  css: {
    html: "<div class='card'>نمونه کارت</div>",
    css: ".card { padding: 16px; border: 1px solid #ddd; }",
    js: "",
  },
  javascript: {
    html: "<h3>JS Playground</h3><p>خروجی را در کنسول ببین.</p>",
    css: "body { font-family: sans-serif; }",
    js: "console.log('Hello CodeNova')",
  },
  htmlcss: {
    html: "<div class='card'>\n  <h2>کارت من</h2>\n  <p>با CSS استایلش کن.</p>\n</div>",
    css: ".card {\n  padding: 16px;\n  border-radius: 12px;\n  border: 1px solid #ddd;\n}",
    js: "",
  },
};

function isBrowser() {
  return typeof window !== "undefined";
}

function draftKey(scope: string, buffer: keyof CodeBuffers) {
  return `codenova:lab:${scope}:${buffer}`;
}

function loadBuffers(scope: string, fallback: CodeBuffers): CodeBuffers {
  if (!isBrowser()) return fallback;
  const read = (buffer: keyof CodeBuffers) => {
    try {
      return window.localStorage.getItem(draftKey(scope, buffer));
    } catch {
      return null;
    }
  };
  return {
    html: read("html") ?? fallback.html,
    css: read("css") ?? fallback.css,
    js: read("js") ?? fallback.js,
  };
}

function saveBuffers(scope: string, buffers: CodeBuffers) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(draftKey(scope, "html"), buffers.html);
    window.localStorage.setItem(draftKey(scope, "css"), buffers.css);
    window.localStorage.setItem(draftKey(scope, "js"), buffers.js);
  } catch (error) {
    console.warn("[lab] could not persist draft:", error);
  }
}

function buildSrcDoc(mode: LabMode, buffers: CodeBuffers) {
  // Escape sequences that would prematurely close the host tags inside srcDoc.
  const safeCss = buffers.css.replace(/<\/style>/gi, "<\\/style>");
  const safeJs = buffers.js.replace(/<\/script>/gi, "<\\/script>");

  return `<!doctype html><html><head><meta charset='utf-8'/><style>${safeCss}</style><script>
  (function(){
    const send=(type,payload)=>parent.postMessage({source:'codenova-lab',type,payload},'*');
    const oldLog=console.log;const oldWarn=console.warn;const oldError=console.error;
    console.log=(...args)=>{send('log',args.join(' '));oldLog(...args)};
    console.warn=(...args)=>{send('warn',args.join(' '));oldWarn(...args)};
    console.error=(...args)=>{send('error-log',args.join(' '));oldError(...args)};
    window.onerror=(message,source,lineno,colno)=>{send('runtime-error',String(message)+' ('+lineno+':'+colno+')')};
  })();
  </script></head><body>${buffers.html}<script>${mode === "javascript" ? safeJs : ""}</script></body></html>`;
}

// Known structural tags across the whole HTML course (text, lists, tables,
// forms, semantics, media, embeds) so every exercise can pass the check.
const KNOWN_HTML_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "blockquote", "code", "pre",
  "strong", "em", "small", "span", "div",
  "ul", "ol", "li", "dl", "dt", "dd",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  "form", "label", "input", "select", "option", "textarea", "button", "fieldset", "legend",
  "a", "img",
  "header", "footer", "nav", "main", "section", "article", "aside", "figure", "figcaption",
  "audio", "video", "iframe", "source", "track",
  "meta", "title", "link", "html", "head", "body",
]);

function simpleCheck(mode: LabMode, buffers: CodeBuffers, hint: string) {
  const lowerHint = hint.toLowerCase();
  if (mode === "html" || mode === "htmlcss") {
    // Pass when at least two *distinct* meaningful tags are present: lenient
    // enough for every course exercise (tables, forms, media...) yet not
    // satisfied by an empty template or one stray tag.
    const found = new Set<string>();
    const pattern = /<([a-z][a-z0-9]*)\b/gi;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(buffers.html)) !== null) {
      const tag = match[1].toLowerCase();
      if (KNOWN_HTML_TAGS.has(tag)) found.add(tag);
    }
    return found.size >= 2;
  }
  if (mode === "css") {
    return /color|background|display|grid|flex|padding|margin|border/i.test(buffers.css) || /color|background|display|grid|flex/.test(lowerHint);
  }
  return /console\.log|return|if|for|while|function|=>/.test(buffers.js) && buffers.js.trim().length > 10;
}

const modeLabels: Record<LabMode, string> = {
  html: "HTML",
  css: "CSS",
  javascript: "JavaScript",
  htmlcss: "HTML+CSS",
};

interface LabWorkspaceProps {
  scope: string;
  mode: LabMode;
  exercise: { slug: string; title: string; description: string; expectedHint: string; hint?: string; starterCode: string } | null;
  theme: "vs-dark" | "light";
}

/**
 * Initial buffers for a workspace mount: persisted draft (per scope) when
 * present, otherwise the exercise starter code or the mode default template.
 * Runs as a lazy useState initializer — once per mount. Switching exercise or
 * mode remounts the workspace (keyed), which re-reads the right draft.
 */
function computeInitialBuffers(scope: string, mode: LabMode, exercise: LabWorkspaceProps["exercise"]): CodeBuffers {
  if (exercise) {
    const base = defaultTemplates[mode];
    const starter: CodeBuffers =
      mode === "javascript"
        ? { ...base, js: exercise.starterCode }
        : mode === "css"
          ? { ...base, css: exercise.starterCode }
          : { ...base, html: exercise.starterCode };
    return loadBuffers(scope, starter);
  }
  return loadBuffers(scope, defaultTemplates[mode]);
}

function LabWorkspace({ scope, mode, exercise, theme }: LabWorkspaceProps) {
  const [buffers, setBuffers] = useState<CodeBuffers>(() => computeInitialBuffers(scope, mode, exercise));
  const [previewDoc, setPreviewDoc] = useState(() => buildSrcDoc(mode, defaultTemplates[mode]));
  const [iframeKey, setIframeKey] = useState(0);
  const [runtimeErrors, setRuntimeErrors] = useState<string[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<Array<{ level: "log" | "warn" | "error"; text: string }>>([]);
  const [checkResult, setCheckResult] = useState<"idle" | "pass" | "fail">("idle");
  const [savedAt, setSavedAt] = useState<string>("");

  const exerciseProgress = useExerciseProgress(exercise?.slug ?? "");

  const patch = (part: Partial<CodeBuffers>) => setBuffers((prev) => ({ ...prev, ...part }));

  // Debounced live preview + autosave (500ms). setState happens inside the
  // timeout callback (async), which is the lint-clean pattern.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPreviewDoc(buildSrcDoc(mode, buffers));
      saveBuffers(scope, buffers);
      setSavedAt(new Date().toLocaleTimeString("fa-IR"));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [mode, buffers, scope]);

  // Console/runtime telemetry from the sandboxed iframe.
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.source !== "codenova-lab") return;
      if (data.type === "runtime-error") {
        setRuntimeErrors((prev) => [...prev.slice(-20), String(data.payload)]);
      }
      if (data.type === "log") {
        setConsoleLogs((prev) => [...prev.slice(-40), { level: "log", text: String(data.payload) }]);
      }
      if (data.type === "warn") {
        setConsoleLogs((prev) => [...prev.slice(-40), { level: "warn", text: String(data.payload) }]);
      }
      if (data.type === "error-log") {
        setConsoleLogs((prev) => [...prev.slice(-40), { level: "error", text: String(data.payload) }]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const runNow = () => {
    setPreviewDoc(buildSrcDoc(mode, buffers));
    saveBuffers(scope, buffers);
    setSavedAt(new Date().toLocaleTimeString("fa-IR"));
    setRuntimeErrors([]);
    setConsoleLogs([]);
    setIframeKey((key) => key + 1);
  };

  const resetToStarter = () => {
    let next: CodeBuffers;
    if (exercise) {
      const base = defaultTemplates[mode];
      next =
        mode === "javascript"
          ? { ...base, js: exercise.starterCode }
          : mode === "css"
            ? { ...base, css: exercise.starterCode }
            : { ...base, html: exercise.starterCode };
    } else {
      next = defaultTemplates[mode];
    }
    setBuffers(next);
    setCheckResult("idle");
  };

  const runCheck = () => {
    if (!exercise) {
      setCheckResult("idle");
      return;
    }
    setCheckResult(simpleCheck(mode, buffers, exercise.expectedHint) ? "pass" : "fail");
  };

  const editorProps = {
    theme,
    options: { minimap: { enabled: false }, fontSize: 13, fontFamily: "var(--font-mono)" },
  } as const;

  const editorBlock = (label: string, language: "html" | "css" | "javascript", value: string, onChange: (v: string) => void, tall: boolean) => (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-surface">
      <div className="flex items-center justify-between border-b border-white/10 bg-surface-elevated px-3 py-2 text-sm font-bold">
        <span dir="ltr">{label}</span>
      </div>
      <div className={tall ? "h-[300px] lg:h-[520px]" : "h-[300px] lg:h-[252px]"} dir="ltr">
        <MonacoEditor language={language} value={value} onChange={(v) => onChange(v ?? "")} {...editorProps} />
      </div>
    </div>
  );

  return (
    <>
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* Editor — 60% on desktop (RTL: first grid column is on the right) */}
        <section className="space-y-4 lg:col-span-3">
          {mode === "html" || mode === "htmlcss" ? (
            mode === "htmlcss" ? (
              <>
                {editorBlock("HTML", "html", buffers.html, (v) => patch({ html: v }), false)}
                {editorBlock("CSS", "css", buffers.css, (v) => patch({ css: v }), false)}
              </>
            ) : (
              editorBlock("HTML", "html", buffers.html, (v) => patch({ html: v }), true)
            )
          ) : null}
          {mode === "css" ? editorBlock("CSS", "css", buffers.css, (v) => patch({ css: v }), true) : null}
          {mode === "javascript" ? editorBlock("JavaScript", "javascript", buffers.js, (v) => patch({ js: v }), true) : null}
        </section>

        {/* Preview + console — 40% on desktop */}
        <section className="space-y-4 lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white">
            <div className="flex items-center justify-between border-b border-slate-300 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700" dir="ltr">
              <span>Preview</span>
              <Button size="sm" variant="outline" onClick={runNow}>اجرا</Button>
            </div>
            <iframe key={iframeKey} title="preview" className="h-[300px] w-full" sandbox="allow-scripts" srcDoc={previewDoc} />
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-surface">
            <div className="flex items-center justify-between border-b border-white/10 bg-surface-elevated px-3 py-2 text-sm font-bold">
              <span>خطاهای Runtime</span>
              <Button size="sm" variant="ghost" onClick={() => setRuntimeErrors([])} aria-label="پاک کردن خطاها">پاک کردن</Button>
            </div>
            <div className="max-h-28 overflow-auto p-3 text-xs text-error" dir="ltr">
              {runtimeErrors.length > 0 ? runtimeErrors.map((e, i) => <p key={`${e}-${i}`}>{e}</p>) : <p dir="rtl">هیچ خطایی نیست.</p>}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-sm font-bold text-slate-200">
              <span dir="ltr">Console</span>
              <Button size="sm" variant="ghost" onClick={() => setConsoleLogs([])} aria-label="پاک کردن کنسول">پاک کردن</Button>
            </div>
            <div className="max-h-36 overflow-auto p-3 text-xs code-ltr">
              {consoleLogs.length > 0 ? (
                consoleLogs.map((item, i) => (
                  <p key={`${item.text}-${i}`} className={item.level === "error" ? "text-red-400" : item.level === "warn" ? "text-yellow-300" : "text-slate-100"}>
                    {item.text}
                  </p>
                ))
              ) : (
                <p className="text-slate-400" dir="rtl">هیچ پیامی ثبت نشده است.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={resetToStarter}>بازنشانی به کد اولیه</Button>
        <Button variant="outline" onClick={runNow}>اجرای فوری</Button>
        <Button onClick={runCheck} disabled={!exercise}>بررسی</Button>
        {exercise ? (
          <Button disabled={checkResult !== "pass" || exerciseProgress.completed} onClick={exerciseProgress.markComplete}>
            {exerciseProgress.completed ? "تمرین قبلاً ثبت شده" : "این تمرین را حل کردم"}
          </Button>
        ) : null}
        {savedAt ? <span className="text-xs text-muted-foreground">آخرین ذخیره: {savedAt}</span> : null}
      </div>

      {checkResult === "pass" ? <p className="mt-2 text-sm text-success">بررسی ساده موفق بود ✅</p> : null}
      {checkResult === "fail" ? <p className="mt-2 text-sm text-error">بررسی ساده رد شد. کد را با راهنما تطبیق بده.</p> : null}
    </>
  );
}

function LabContent() {
  const searchParams = useSearchParams();
  const exerciseSlug = searchParams.get("exercise");
  const foundExercise = lessonExercises.find((item) => item.slug === exerciseSlug) ?? null;
  const invalidExercise = Boolean(exerciseSlug && !foundExercise);

  const [freeMode, setFreeMode] = useState<LabMode>("htmlcss");
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");

  const mode: LabMode = foundExercise ? (foundExercise.language as LabMode) : freeMode;
  const scope = foundExercise ? foundExercise.slug : "default";

  return (
    <>
      <Header />
      <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-2xl font-bold">آزمایشگاه کد</h1>
        <p className="mt-1 text-sm text-muted-foreground">محیط تمرین HTML/CSS/JavaScript با پیش‌نمایش زنده و پنل خطا</p>

        <Alert variant="warning" className="mt-4">
          این محیط برای یادگیری است؛ کد نامطمئن اجرا نکنید. بررسی تمرین‌ها ساده و قابل‌دور زدن است و sandbox فعلی امنیت کامل نمی‌دهد.
        </Alert>

        {invalidExercise ? (
          <Alert variant="error" className="mt-4">
            تمرین انتخاب‌شده نامعتبر است. <Link href="/exercises" className="underline">بازگشت به لیست تمرین‌ها</Link>
          </Alert>
        ) : null}

        {foundExercise ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-surface/70 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">تمرین فعال</Badge>
              <Badge variant="neutral">{foundExercise.language.toUpperCase()}</Badge>
              <p className="text-sm font-semibold">{foundExercise.title}</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{foundExercise.description}</p>
            <p className="mt-2 text-xs text-info">خروجی مورد انتظار: {foundExercise.expectedHint}</p>
            {foundExercise.hint ? <p className="mt-1 text-xs text-warning">راهنمایی (نه جواب کامل): {foundExercise.hint}</p> : null}
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {(Object.keys(modeLabels) as LabMode[]).map((item) => (
              <Button key={item} size="sm" variant={freeMode === item ? "primary" : "outline"} onClick={() => setFreeMode(item)} aria-label={`انتخاب ${modeLabels[item]}`}>
                {modeLabels[item]}
              </Button>
            ))}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as "vs-dark" | "light")}
              className="rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs"
              aria-label="تم ادیتور"
            >
              <option value="vs-dark">vs-dark</option>
              <option value="light">light</option>
            </select>
          </div>
        )}

        {!invalidExercise ? (
          <LabWorkspace
            key={`${scope}|${mode}`}
            scope={scope}
            mode={mode}
            theme={theme}
            exercise={
              foundExercise
                ? {
                    slug: foundExercise.slug,
                    title: foundExercise.title,
                    description: foundExercise.description,
                    expectedHint: foundExercise.expectedHint,
                    hint: foundExercise.hint,
                    starterCode: foundExercise.starterCode,
                  }
                : null
            }
          />
        ) : null}
      </motion.main>
    </>
  );
}

export default function LabPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">در حال بارگذاری آزمایشگاه...</div>}>
      <LabContent />
    </Suspense>
  );
}
