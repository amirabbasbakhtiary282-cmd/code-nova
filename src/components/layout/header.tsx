"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { fadeIn } from "@/lib/motion";
import { MobileNav } from "./mobile-nav";

const baseNavItems = [
  { href: "/", label: "خانه" },
  { href: "/courses", label: "دوره‌ها" },
  { href: "/lab", label: "آزمایشگاه" },
  { href: "/exercises", label: "تمرین‌ها" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && Boolean(session?.user);

  const navItems = useMemo(
    () => (isAuthenticated ? [...baseNavItems, { href: "/dashboard", label: "داشبورد" }] : baseNavItems),
    [isAuthenticated],
  );

  const handleSignOut = () => {
    void signOut({ callbackUrl: "/" });
  };

  return (
    <motion.header
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="sticky top-0 z-40 border-b border-white/10 bg-[#050510]/70 backdrop-blur-2xl"
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="باز کردن منو"
          className="rounded p-2 text-muted-foreground hover:bg-surface-elevated md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="text-xl font-extrabold text-foreground">
          کدنوا
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
              <span className="absolute -bottom-1 right-0 h-px w-full origin-right scale-x-0 bg-[linear-gradient(135deg,#8B5CF6,#3B82F6)] transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <span className="max-w-40 truncate text-xs text-muted-foreground" title={session?.user?.email ?? undefined}>
                {session?.user?.name || session?.user?.email}
              </span>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">داشبورد</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>خروج</Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">ورود</Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="border-0 bg-[linear-gradient(135deg,#10B981,#3B82F6)] text-white shadow-[0_0_30px_-10px_rgba(16,185,129,0.7)] hover:opacity-95"
                >
                  شروع رایگان
                </Button>
              </Link>
            </>
          )}
        </div>

        <MobileNav open={open} onClose={() => setOpen(false)} items={navItems} isAuthenticated={isAuthenticated} userName={session?.user?.name ?? null} onSignOut={handleSignOut} />
      </div>
    </motion.header>
  );
}
