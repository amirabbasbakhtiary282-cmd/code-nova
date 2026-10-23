"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock3, Code2, Rocket, Sparkles, Target, Workflow } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { GlowButton } from "@/components/ui/glow-button";
import { Reveal } from "@/components/ui/reveal";
import { courses } from "@/content/courses/courses";
import { lessonExercises, lessonsByCourse } from "@/content/courses";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="p-3 text-xs text-muted-foreground">در حال بارگذاری ادیتور...</div>,
});

const heroFrames = [
  "<h1 style='color:#8B5CF6'>سلام کدنوا 👋</h1>\n<p>اولین قدم برنامه‌نویسی را بردار.</p>",
  "<button style='padding:8px 14px;border:none;border-radius:10px;background:#10B981;color:white'>شروع رایگان</button>",
  "<ul><li>درس</li><li>تمرین</li><li>پیشرفت</li></ul>",
];

/**
 * Typewriter for one hero frame. Mounted with `key={text}` so each frame gets
 * a fresh component — the reset happens via remount instead of a synchronous
 * setState inside an effect (react-hooks/set-state-in-effect).
 */
function Typewriter({ text }: { text: string }) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let idx = 0;
    const typeTimer = window.setInterval(() => {
      idx += 1;
      setTyped(text.slice(0, idx));
      if (idx >= text.length) window.clearInterval(typeTimer);
    }, 18);
    return () => window.clearInterval(typeTimer);
  }, [text]);

  return <pre className="whitespace-pre-wrap">{typed}</pre>;
}

export function HomePageContent() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [labCode, setLabCode] = useState("<h2>CodeNova Lab</h2>\n<p>اینجا کد خودت را تست کن.</p>");
  const [labPreview, setLabPreview] = useState(labCode);

  const activeFrame = heroFrames[frameIndex];

  // Rotate hero frames; the typing reset is handled by <Typewriter key=...>.
  useEffect(() => {
    const rotateTimer = window.setTimeout(() => {
      setFrameIndex((prev) => (prev + 1) % heroFrames.length);
    }, 3400);
    return () => window.clearTimeout(rotateTimer);
  }, [activeFrame]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLabPreview(labCode);
    }, 420);

    return () => window.clearTimeout(timer);
  }, [labCode]);

  const heroPreview = useMemo(
    () => `<!doctype html><html><body style="font-family:sans-serif;padding:16px">${activeFrame}</body></html>`,
    [activeFrame],
  );

  // Real numbers derived from content — no inflated mock claims.
  const totalLessons = Object.values(lessonsByCourse).reduce((sum, list) => sum + list.length, 0);
  const statCards = [
    { title: "درس واقعی", value: totalLessons, suffix: "", icon: BookOpen, grad: "from-[#8B5CF6] to-[#3B82F6]" },
    { title: "دوره کامل", value: courses.length, suffix: "", icon: Workflow, grad: "from-[#3B82F6] to-[#10B981]" },
    { title: "تمرین", value: lessonExercises.length, suffix: "+", icon: Code2, grad: "from-[#EC4899] to-[#8B5CF6]" },
    { title: "دسترسی", value: 24, suffix: "/7", icon: Clock3, grad: "from-[#EC4899] to-[#F97316]" },
  ] as const;

  return (
    <main className="relative overflow-hidden bg-[#050510] text-[#F0F0FF] nft-grain">
      <section className="relative pb-20 pt-16 md:pt-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(139,92,246,0.26),transparent_35%),radial-gradient(circle_at_82%_10%,rgba(59,130,246,0.24),transparent_30%),radial-gradient(circle_at_78%_78%,rgba(236,72,153,0.18),transparent_32%)]" />
        <div className="nft-blob pointer-events-none absolute -top-24 left-20 h-72 w-72 rounded-full bg-[#8B5CF6]/35 blur-[100px]" />
        <div className="nft-blob pointer-events-none absolute -right-10 top-24 h-64 w-64 rounded-full bg-[#3B82F6]/35 blur-[100px]" style={{ animationDelay: "-2s" }} />
        <div className="nft-blob pointer-events-none absolute bottom-10 left-1/2 h-56 w-56 rounded-full bg-[#EC4899]/25 blur-[100px]" style={{ animationDelay: "-4s" }} />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:items-center">
          <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#8888AA] backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" /> پلتفرم فارسی آموزش برنامه‌نویسی
            </motion.div>

            <motion.h1 variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="mt-5 text-5xl leading-tight font-black tracking-[-0.03em] md:text-7xl">
              برنامه‌نویسی را <span className="bg-[linear-gradient(135deg,#8B5CF6,#3B82F6)] bg-clip-text text-transparent [text-shadow:0_0_30px_rgba(139,92,246,0.45)]">واقعی</span> یاد بگیر
            </motion.h1>

            <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="mt-5 max-w-xl text-[18px] leading-8 text-[#8888AA]">
              از مفهوم تا نوشتن کد، دیدن خطا، اصلاح آن و اثبات یادگیری با تمرین — همه در یک محیط فارسی.
            </motion.p>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <GlowButton size="lg" className="border-0 bg-[linear-gradient(135deg,#10B981,#3B82F6)] text-white shadow-[0_0_45px_-14px_rgba(16,185,129,0.8)]">
                  شروع رایگان
                </GlowButton>
              </Link>
              <Link href="/lab">
                <GlowButton size="lg" variant="outline" className="border-[#8B5CF6]/70 bg-white/5 text-[#F0F0FF] shadow-none backdrop-blur-xl">
                  امتحان آزمایشگاه
                </GlowButton>
              </Link>
            </motion.div>
          </motion.div>

          <Reveal>
            <div className="relative">
              <div className="pointer-events-none absolute -inset-8 -z-10 rounded-3xl bg-[radial-gradient(circle,rgba(139,92,246,0.35),transparent_60%)] blur-3xl" />
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#0A0A1A] p-3 text-xs text-emerald-300 code-ltr min-h-[170px]">
                    <Typewriter key={activeFrame} text={activeFrame} />
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white">
                    <div className="border-b border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-600" dir="ltr">Live Preview</div>
                    <iframe title="hero-preview" className="h-[150px] w-full" sandbox="allow-scripts" srcDoc={heroPreview} />
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="nft-float rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-emerald-300 backdrop-blur-xl">
                    درس ۱ کامل شد ✓
                  </div>
                  <div className="nft-float rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-violet-300 backdrop-blur-xl" style={{ animationDelay: "-1s" }}>
                    Progress: 35%
                    <div className="mt-2 h-1.5 rounded-full bg-white/10">
                      <div className="h-full w-[35%] rounded-full bg-[linear-gradient(135deg,#8B5CF6,#3B82F6)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, idx) => (
            <Reveal key={stat.title} delay={idx * 0.05}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-[#8B5CF6]/60 hover:shadow-[0_0_45px_-18px_rgba(139,92,246,0.75)]">
                <div className={`inline-flex rounded-xl bg-gradient-to-r p-2 text-white ${stat.grad}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm text-[#8888AA]">{stat.title}</p>
                <p className="mt-1 text-3xl font-black">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-center text-3xl font-extrabold md:text-4xl">مسیر یادگیری خودت را انتخاب کن</h2>
        </Reveal>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {courses.map((course, idx) => (
            <Reveal key={course.id} delay={idx * 0.06}>
              <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[#0D0D1F] transition-all hover:-translate-y-1 hover:border-[#8B5CF6]/70 hover:shadow-[0_0_55px_-24px_rgba(139,92,246,0.75)]">
                <div className={`h-28 bg-gradient-to-r ${idx === 0 ? "from-[#8B5CF6] to-[#3B82F6]" : idx === 1 ? "from-[#3B82F6] to-[#10B981]" : "from-[#EC4899] to-[#8B5CF6]"}`} />
                <div className="p-5">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-[#C8C8E8]">
                    {course.level === "beginner" ? "مقدماتی" : "متوسط"}
                  </span>
                  <h3 className="mt-3 text-xl font-bold">{course.title}</h3>
                  <p className="mt-2 text-sm text-[#8888AA]">{course.description}</p>
                  <p className="mt-3 text-xs text-[#8888AA]">{course.lessonCount} درس · {course.durationMinutes} دقیقه</p>
                  <Link href={`/courses/${course.slug}`} className="mt-4 inline-block rounded-lg bg-[linear-gradient(135deg,#8B5CF6,#3B82F6)] px-4 py-2 text-sm font-semibold text-white">
                    شروع دوره
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-center text-3xl font-extrabold md:text-4xl">چرا کدنوا؟</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "یادگیری پیوسته", desc: "از مفهوم تا تمرین در یک مسیر واقعی.", icon: Workflow },
            { title: "آزمایشگاه واقعی", desc: "کد بنویس و نتیجه را همان لحظه ببین.", icon: Code2 },
            { title: "محتوای فارسی", desc: "بدون نیاز به ترجمه منابع پراکنده.", icon: BookOpen },
            { title: "پیشرفت شفاف", desc: "دقیق بدان در چه مرحله‌ای هستی.", icon: Target },
          ].map((item, idx) => (
            <Reveal key={item.title} delay={idx * 0.05}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-[#EC4899]/60 hover:shadow-[0_0_45px_-18px_rgba(236,72,153,0.7)]">
                <div className="inline-flex rounded-xl bg-[linear-gradient(135deg,#EC4899,#8B5CF6)] p-2 text-white transition-transform hover:scale-110">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-[#8888AA]">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <Reveal>
            <h2 className="text-2xl font-extrabold">کد را همین‌جا بنویس و اجرا کن</h2>
            <p className="mt-2 text-[#8888AA]">دموی زنده: ادیتور سمت راست، خروجی سمت چپ</p>
          </Reveal>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0A0A1A]" dir="ltr">
              <MonacoEditor
                language="html"
                value={labCode}
                onChange={(value) => setLabCode(value ?? "")}
                theme="vs-dark"
                options={{ minimap: { enabled: false }, fontSize: 13, fontFamily: "var(--font-mono)" }}
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white">
              <div className="border-b border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-600" dir="ltr">Preview</div>
              <iframe title="landing-lab-preview" sandbox="allow-scripts" className="h-[260px] w-full" srcDoc={labPreview} />
            </div>
          </div>

          <Link href="/lab" className="mt-5 inline-block rounded-lg bg-[linear-gradient(135deg,#10B981,#3B82F6)] px-4 py-2 text-sm font-bold text-white shadow-[0_0_45px_-15px_rgba(16,185,129,0.8)]">
            رفتن به آزمایشگاه
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <Reveal>
          <div className="rounded-[24px] bg-[linear-gradient(135deg,#8B5CF6,#3B82F6)] px-6 py-12 text-center text-white shadow-[0_0_90px_-28px_rgba(139,92,246,0.85)]">
            <Rocket className="mx-auto h-8 w-8" />
            <h2 className="mt-3 text-3xl font-black md:text-4xl">آماده‌ای شروع کنی؟</h2>
            <p className="mt-2 text-white/90">همین حالا اولین درس را رایگان ببین.</p>
            <Link href="/register" className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-extrabold text-[#0D0D1F] hover:bg-slate-100">
              شروع رایگان
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
