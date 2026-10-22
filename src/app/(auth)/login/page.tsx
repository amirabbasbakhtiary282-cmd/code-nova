import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { PageEnter } from "@/components/ui/page-enter";

export default function LoginPage() {
  return (
    <>
      <Header />
      <PageEnter>
        <main className="mx-auto max-w-md px-4 py-16">
          <Card className="border-white/10 bg-surface/75">
            <CardTitle>ورود (نمایشی)</CardTitle>
            <CardBody className="mt-2">احراز هویت واقعی در فاز بک‌اند پیاده‌سازی می‌شود.</CardBody>
            <Link href="/dashboard" className="mt-4 inline-block">
              <Button>ورود نمایشی</Button>
            </Link>
          </Card>
        </main>
      </PageEnter>
    </>
  );
}
