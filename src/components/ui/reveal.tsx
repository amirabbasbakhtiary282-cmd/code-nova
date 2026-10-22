"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { slideUp } from "@/lib/motion";

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
