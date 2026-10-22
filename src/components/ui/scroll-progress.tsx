"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.25 });

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-right bg-gradient-to-l from-primary via-secondary-accent to-primary"
      style={{ scaleX }}
    />
  );
}
