"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { slideInRight } from "@/lib/motion";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  items: Array<{ href: string; label: string }>;
  isAuthenticated: boolean;
  userName: string | null;
  onSignOut: () => void;
}

export function MobileNav({ open, onClose, items, isAuthenticated, userName, onSignOut }: MobileNavProps) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <motion.button
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-label="بستن منو"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.aside
            className="absolute right-0 top-0 h-full w-72 border-l border-border bg-surface/90 p-4 backdrop-blur-xl"
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-bold text-primary">کدنوا</span>
              <button onClick={onClose} className="rounded px-2 py-1 hover:bg-surface-elevated" aria-label="بستن">
                ✕
              </button>
            </div>

            <nav className="space-y-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-6 grid gap-2">
              {isAuthenticated ? (
                <>
                  <p className="px-3 text-xs text-muted-foreground">وارد شده به عنوان {userName ?? "کاربر"}</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      onClose();
                      onSignOut();
                    }}
                  >
                    خروج
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={onClose}>
                    <Button variant="ghost" className="w-full">ورود</Button>
                  </Link>
                  <Link href="/register" onClick={onClose}>
                    <Button className="w-full">شروع رایگان</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
