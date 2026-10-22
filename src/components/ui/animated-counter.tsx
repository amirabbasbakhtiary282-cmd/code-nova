"use client";

import { animate, useInView, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsub = motionValue.on("change", (latest) => setDisplay(Math.round(latest)));
    return () => unsub();
  }, [motionValue]);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, value, { duration: 1.1, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, motionValue, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}
