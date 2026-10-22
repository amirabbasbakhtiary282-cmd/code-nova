"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

type GlowButtonProps = ComponentProps<typeof Button>;

export function GlowButton({ className, ...props }: GlowButtonProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative inline-flex">
      <span className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-[radial-gradient(circle,rgba(16,185,129,0.5),transparent_65%)] opacity-0 blur-2xl transition-opacity duration-200 group-hover:opacity-100" />
      <Button className={cn("group shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_0_40px_-16px_rgba(16,185,129,0.7)]", className)} {...props} />
    </motion.div>
  );
}
