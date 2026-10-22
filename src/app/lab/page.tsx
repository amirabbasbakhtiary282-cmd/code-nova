"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { lessonExercises } from "@/content/courses/lessons";
import { useExerciseProgress } from "@/features/progress/hooks";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="p-4 text-xs text-muted-foreground">در حال بارگذاری ادیتور...</div>,
});

type LabLanguage = "html" | "css" | "javascript";

const defaultTemplates = {
  html: { html: "<h1>سلام کدنوا</h1>\n<p>کد HTML خودت را بنویس.</p>", css: "body { font-family: sans-serif; }" },
  css: { html: "<div class='card'>نمونه کارت</div>", css: ".card { padding: 16px; border: 1px solid #ddd; }" },
  javascript: { html: "<h3>JS Playground</h3><p>خروجی را در کنسول ببین.</p>", css: "body { font-family: sans-serif; }", js: "console.log('Hello CodeNova')" },
};

function storageKey(exerciseSlug: string | null, key: string) {
  return `codenova:lab:${exerciseSlug ?? "default"}:${key}`;
}

function buildSrcDoc(language: LabLanguage, htmlCode: string, cssCode: string, jsCode: string) {
  const safeJs = jsCode.replace(/<\/script>/gi, "<\\/script>");

  return `<!doctype html><html><head><meta charset='utf-8'/><style>${cssCode}</style><script>
  (function(){
    const send=(type,payload)=>parent.postMessage({source:'codenova-lab',type,payload},'*');
    const oldLog=console.log;const oldWarn=console.warn;const oldError=console.error;
    console.log=(...args)=>{send('log',args.join(' '));oldLog(...args)};
    console.warn=(...args)=>{send('warn',args.join(' '));oldWarn(...args)};
    console.error=(...args)=>{send('error-log',args.join(' '));oldError(...args)};
    window.onerror=(message,source,lineno,colno)=>{send('runtime-error',String(message)+' ('+lineno+':'+colno+')')};
  })();
  </script></head><body>${htmlCode}<script>${language === "javascript" ? safeJs : ""}</script></body></html>`;
}

function simpleCheck(language: LabLanguage, code: { html: string; css: string; js: string }, hint: string) {
  const lowerHint = hint.toLowerCase();
  if (language === "html") {
    const hasH = /<h[1-6][\s>]/i.test(code.html);
    const hasP = /<p[\s>]/i.test(code.html);
    return hasH && hasP;
  }
  if (language === "css") {
    return /color|background|display|grid|flex|padding|margin|border/i.test(code.css) || /color|background|display|grid|flex/.test(lowerHint);
  }
  return /console\.log|return|if|for|while|function|=>/.test(code.js) && code.js.trim().length > 10;
}

function LabContent() {
  const searchParams = useSearchParams();
  const exerciseSlug = searchParams.get("exercise");
  const foundExercise = lessonExercises.find((item) => item.slug === exerciseSlug) ?? null;
  const invalidExercise = Boolean(exerciseSlug && !foundExercise);

  const [selectedLanguage, setSelectedLanguage] = useState<LabLanguage>(foundExercise?.language ?? "html");

  const exerciseProgress = useExerciseProgress(foundExercise?.slug ?? "");

  const [htmlCode, setHtmlCode] = useState(defaultTemplates.html.html);
  const [cssCode, setCssCode] = useState(defaultTemplates.html.css);
  const [jsCode, setJsCode] = useState(defaultTemplates.javascript.js);
  const [previewDoc, setPreviewDoc] = useState(buildSrcDoc("html", defaultTemplates.html.html, defaultTemplates.html.css, ""));
  const [runtimeErrors, setRuntimeErrors] = useState<string[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<Array<{ level: "log" | "warn" | "error"; text: string }>>([]);
  const [checkResult, setCheckResult] = useState<"idle" | "pass" | "fail">("idle");
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "light">("vs-dark");
  const [editorVersion, setEditorVersion] = useState(0);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string>("");

  const language = foundExercise?.language ?? selectedLanguage;

  useEffect(() => {
    if (foundExercise) {
      setSelectedLanguage(foundExercise.language);
      if (foundExercise.language === "html") {
        const savedHtml = window.localStorage.getItem(storageKey(foundExercise.slug, "html"));
        const savedCss = window.localStorage.getItem(storageKey(foundExercise.slug, "css"));
        setHtmlCode(savedHtml ?? foundExercise.starterCode);
        setCssCode(savedCss ?? "body { font-family: sans-serif; }\nh1 { color: #2563eb; }");
        setJsCode("");
      } else if (foundExercise.language === "css") {
        const savedCss = window.localStorage.getItem(storageKey(foundExercise.slug, "css"));
        setHtmlCode(defaultTemplates.css.html);
        setCssCode(savedCss ?? foundExercise.starterCode);
        setJsCode("");
      } else {
        const savedJs = window.localStorage.getItem(storageKey(foundExercise.slug, "js"));
        setHtmlCode(defaultTemplates.javascript.html);
        setCssCode(defaultTemplates.javascript.css);
        setJsCode(savedJs ?? foundExercise.starterCode);
      }
    } else {
      const key = storageKey(null, selectedLanguage);
      const saved = window.localStorage.getItem(key);
      if (selectedLanguage === "html") {
        setHtmlCode(saved ?? defaultTemplates.html.html);
        setCssCode(window.localStorage.getItem(storageKey(null, "css")) ?? defaultTemplates.html.css);
        setJsCode("");
      } else if (selectedLanguage === "css") {
        setHtmlCode(defaultTemplates.css.html);
        setCssCode(saved ?? defaultTemplates.css.css);
        setJsCode("");
      } else {
        setHtmlCode(defaultTemplates.javascript.html);
        setCssCode(defaultTemplates.javascript.css);
        setJsCode(saved ?? defaultTemplates.javascript.js);
      }
    }
    setCheckResult("idle");
  }, [foundExercise, selectedLanguage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const doc = buildSrcDoc(language, htmlCode, cssCode, jsCode);
      setPreviewDoc(doc);
      const now = new Date().toLocaleTimeString("fa-IR");
      if (foundExercise) {
        window.localStorage.setItem(storageKey(foundExercise.slug, "html"), htmlCode);
        window.localStorage.setItem(storageKey(foundExercise.slug, "css"), cssCode);
        window.localStorage.setItem(storageKey(foundExercise.slug, "js"), jsCode);
      } else {
        window.localStorage.setItem(storageKey(null, selectedLanguage), selectedLanguage === "javascript" ? jsCode : selectedLanguage === "css" ? cssCode : htmlCode);
        window.localStorage.setItem(storageKey(null, "css"), cssCode);
      }
      setSavedAt(now);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [language, htmlCode, cssCode, jsCode, foundExercise, selectedLanguage]);

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

  const canMarkSolved = checkResult === "pass";

  const resetToStarter = () => {
    if (foundExercise) {
      if (foundExercise.language === "javascript") setJsCode(foundExercise.starterCode);
      if (foundExercise.language === "css") setCssCode(foundExercise.starterCode);
      if (foundExercise.language === "html") setHtmlCode(foundExercise.starterCode);
      setCheckResult("idle");
      return;
    }

    if (selectedLanguage === "html") {
      setHtmlCode(defaultTemplates.html.html);
      setCssCode(defaultTemplates.html.css);
    } else if (selectedLanguage === "css") {
      setCssCode(defaultTemplates.css.css);
      setHtmlCode(defaultTemplates.css.html);
    } else {
      setJsCode(defaultTemplates.javascript.js);
      setHtmlCode(defaultTemplates.javascript.html);
      setCssCode(defaultTemplates.javascript.css);
    }
  };

  const runCheck = () => {
    if (!foundExercise) {
      setCheckResult("idle");
      return;
    }
    const ok = simpleCheck(language, { html: htmlCode, css: cssCode, js: jsCode }, foundExercise.expectedHint);
    setCheckResult(ok ? "pass" : "fail");
  };

  const saveNow = () => {
    const now = new Date().toLocaleTimeString("fa-IR");
    if (foundExercise) {
      window.localStorage.setItem(storageKey(foundExercise.slug, "html"), htmlCode);
      window.localStorage.setItem(storageKey(foundExercise.slug, "css"), cssCode);
      window.localStorage.setItem(storageKey(foundExercise.slug, "js"), jsCode);
    } else {
      window.localStorage.setItem(storageKey(null, selectedLanguage), selectedLanguage === "javascript" ? jsCode : selectedLanguage === "css" ? cssCode : htmlCode);
    }
    setSavedAt(now);
  };

  const editorCommonProps = {
    theme: editorTheme,
    options: { minimap: { enabled: false }, fontSize: 13 },
    onMount: () => setEditorError(null),
  } as const;

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
            <p className="mt-2 text-xs text-info">راهنما: {foundExercise.expectedHint}</p>
          </div>
        ) : null}

        {!foundExercise ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="sm" variant={selectedLanguage === "html" ? "primary" : "outline"} onClick={() => setSelectedLanguage("html")} aria-label="انتخاب HTML">HTML</Button>
            <Button size="sm" variant={selectedLanguage === "css" ? "primary" : "outline"} onClick={() => setSelectedLanguage("css")} aria-label="انتخاب CSS">CSS</Button>
            <Button size="sm" variant={selectedLanguage === "javascript" ? "primary" : "outline"} onClick={() => setSelectedLanguage("javascript")} aria-label="انتخاب JavaScript">JavaScript</Button>
            <select
              value={editorTheme}
              onChange={(e) => setEditorTheme(e.target.value as "vs-dark" | "light")}
              className="rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs"
              aria-label="تم ادیتور"
            >
              <option value="vs-dark">vs-dark</option>
              <option value="light">light</option>
            </select>
          </div>
        ) : null}

        {editorError ? (
          <Alert variant="error" className="mt-4">
            خطا در بارگذاری ادیتور Monaco. <Button size="sm" variant="outline" onClick={() => setEditorVersion((v) => v + 1)}>تلاش مجدد</Button>
          </Alert>
        ) : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="space-y-4">
            {language === "html" ? (
              <>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-surface">
                  <div className="border-b border-white/10 bg-surface-elevated px-3 py-2 text-sm font-bold">HTML Editor</div>
                  <div className="h-56" dir="ltr">
                    <MonacoEditor
                      key={`html-${editorVersion}`}
                      language="html"
                      value={htmlCode}
                      onChange={(v) => setHtmlCode(v ?? "")}
                      {...editorCommonProps}
                      onValidate={() => setEditorError(null)}
                    />
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-surface">
                  <div className="border-b border-white/10 bg-surface-elevated px-3 py-2 text-sm font-bold">CSS Editor</div>
                  <div className="h-56" dir="ltr">
                    <MonacoEditor
                      key={`css-${editorVersion}`}
                      language="css"
                      value={cssCode}
                      onChange={(v) => setCssCode(v ?? "")}
                      {...editorCommonProps}
                      onValidate={() => setEditorError(null)}
                    />
                  </div>
                </div>
              </>
            ) : language === "css" ? (
              <div className="overflow-hidden rounded-xl border border-white/10 bg-surface">
                <div className="border-b border-white/10 bg-surface-elevated px-3 py-2 text-sm font-bold">CSS Editor</div>
                <div className="h-[470px]" dir="ltr">
                  <MonacoEditor
                    key={`css-only-${editorVersion}`}
                    language="css"
                    value={cssCode}
                    onChange={(v) => setCssCode(v ?? "")}
                    {...editorCommonProps}
                    onValidate={() => setEditorError(null)}
                  />
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/10 bg-surface">
                <div className="border-b border-white/10 bg-surface-elevated px-3 py-2 text-sm font-bold">JavaScript Editor</div>
                <div className="h-[470px]" dir="ltr">
                  <MonacoEditor
                    key={`js-${editorVersion}`}
                    language="javascript"
                    value={jsCode}
                    onChange={(v) => setJsCode(v ?? "")}
                    {...editorCommonProps}
                    onValidate={() => setEditorError(null)}
                  />
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white">
              <div className="border-b border-slate-300 bg-slate-100 px-3 py-2 text-left text-sm font-bold text-slate-700" dir="ltr">Preview</div>
              <iframe title="preview" className="h-[260px] w-full" sandbox="allow-scripts" srcDoc={previewDoc} />
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-surface">
              <div className="border-b border-white/10 bg-surface-elevated px-3 py-2 text-sm font-bold">خطاهای Runtime</div>
              <div className="max-h-28 overflow-auto p-3 text-xs text-error">
                {runtimeErrors.length > 0 ? runtimeErrors.map((e, i) => <p key={`${e}-${i}`}>{e}</p>) : <p>هیچ خطایی نیست.</p>}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-sm font-bold text-slate-200">
                <span>Console</span>
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
                  <p className="text-slate-400">هیچ پیامی ثبت نشده است.</p>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={resetToStarter}>بازنشانی به کد اولیه</Button>
          <Button variant="outline" onClick={saveNow}>ذخیره</Button>
          <Button onClick={runCheck} disabled={!foundExercise}>بررسی</Button>
          {foundExercise ? (
            <Button disabled={!canMarkSolved || exerciseProgress.completed} onClick={exerciseProgress.markComplete}>
              {exerciseProgress.completed ? "تمرین قبلاً ثبت شده" : "این تمرین را حل کردم"}
            </Button>
          ) : null}
          {savedAt ? <span className="text-xs text-muted-foreground">آخرین ذخیره: {savedAt}</span> : null}
        </div>

        {checkResult === "pass" ? <p className="mt-2 text-sm text-success">بررسی ساده موفق بود ✅</p> : null}
        {checkResult === "fail" ? <p className="mt-2 text-sm text-error">بررسی ساده رد شد. کد را با راهنما تطبیق بده.</p> : null}
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
