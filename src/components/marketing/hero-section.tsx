"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";

const HeroCanvas = dynamic(() => import("./hero-canvas").then((mod) => mod.HeroCanvas), {
  ssr: false,
  loading: () => null,
});

function supportsWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export function HeroSection() {
  const containerRef = useRef<HTMLElement | null>(null);
  const [showCanvas, setShowCanvas] = useState(false);
  const [code, setCode] = useState("<h2>سلام کدنوا 👋</h2>\n<p>من در حال یادگیری هستم.</p>");
  const [preview, setPreview] = useState(code);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0.3]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setShowCanvas(mq.matches && supportsWebGL());
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setPreview(code), 220);
    return () => window.clearTimeout(timer);
  }, [code]);

  const cards = useMemo(
    () => [
      "<section>\n  <h1>CodeNova</h1>\n</section>",
      "const skill = 'JavaScript';\nconsole.log(skill);",
      ".card {\n  border-radius: 16px;\n}",
    ],
    [],
  );

  return (
    <section ref={containerRef} className="relative overflow-hidden pb-20 pt-16 md:pt-24">
      {showCanvas ? <HeroCanvas /> : null}

      <motion.div style={{ y: yParallax, opacity }} className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-extrabold tracking-[-0.03em] md:text-6xl"
          >
            برنامه‌نویسی را واقعی یاد بگیر
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            از یادگیری مفهوم تا نوشتن کد، دیدن خطا و اصلاح آن؛ یک مسیر فارسی، تعاملی و کاربردی.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/register">
              <GlowButton size="lg">شروع رایگان</GlowButton>
            </Link>
            <Link href="/lab">
              <GlowButton size="lg" variant="outline" className="shadow-none">
                ورود به آزمایشگاه
              </GlowButton>
            </Link>
          </motion.div>

          <div className="relative mt-10 rounded-2xl border border-white/10 bg-surface/70 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <textarea
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-40 resize-none rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-green-300 outline-none"
              />
              <iframe
                title="hero-live-preview"
                sandbox="allow-scripts"
                className="h-40 rounded-xl border border-slate-300 bg-white"
                srcDoc={preview}
              />
            </div>
          </div>
        </div>

        <motion.div
          className="relative perspective-[1000px]"
          onMouseMove={(event) => {
            const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
            rotateY.set(x * 5);
            rotateX.set(-y * 5);
          }}
          onMouseLeave={() => {
            rotateX.set(0);
            rotateY.set(0);
          }}
          style={{ rotateX, rotateY }}
        >
          <div className="pointer-events-none absolute -inset-8 -z-10 bg-[radial-gradient(circle,rgba(16,185,129,0.25),transparent_55%)] blur-3xl" />
          <div className="space-y-4">
            {cards.map((snippet, index) => (
              <motion.div
                key={snippet}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index, duration: 0.28 }}
                style={{
                  transform: `translateZ(${index * 16}px) rotateY(${index % 2 === 0 ? -8 : 8}deg)`,
                }}
              >
                <GlassCard className="code-ltr border-white/15 bg-white/6">
                  <pre className="overflow-hidden text-ellipsis text-xs text-emerald-200/90">{snippet}</pre>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
