import Link from "next/link";
import { PageEnter } from "@/components/ui/page-enter";
import { GlowButton } from "@/components/ui/glow-button";

export default function NotFound() {
  return (
    <PageEnter>
      <main className="grid min-h-screen place-items-center px-4 text-center">
        <section className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,rgba(99,102,241,0.35),transparent_60%)] blur-3xl" />
          <p className="text-7xl font-extrabold tracking-tight text-primary">۴۰۴</p>
          <h1 className="mt-4 text-2xl font-bold">صفحه پیدا نشد</h1>
          <p className="mt-2 text-muted-foreground">آدرس واردشده معتبر نیست یا صفحه حذف شده است.</p>
          <Link href="/" className="mt-6 inline-flex">
            <GlowButton>بازگشت به خانه</GlowButton>
          </Link>
        </section>
      </main>
    </PageEnter>
  );
}
