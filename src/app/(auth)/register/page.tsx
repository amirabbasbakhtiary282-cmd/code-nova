import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { PageEnter } from "@/components/ui/page-enter";

export default function RegisterPage() {
  return (
    <>
      <Header />
      <PageEnter>
        <main className="mx-auto max-w-md px-4 py-16">
          <Card className="border-white/10 bg-surface/75">
            <CardTitle>شروع رایگان (نمایشی)</CardTitle>
            <CardBody className="mt-2">ثبت‌نام واقعی خارج از محدوده فاز فرانت است و در فاز بعد اجرا می‌شود.</CardBody>
            <Link href="/courses" className="mt-4 inline-block">
              <Button>مشاهده دوره‌ها</Button>
            </Link>
          </Card>
        </main>
      </PageEnter>
    </>
  );
}
