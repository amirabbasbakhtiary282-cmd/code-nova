"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageEnter } from "@/components/ui/page-enter";
import { loginAction, type AuthFormState } from "../actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const registered = searchParams.get("registered") === "1";
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(loginAction, {});

  return (
    <Card className="border-white/10 bg-surface/75">
      <CardTitle>ورود</CardTitle>
      <CardBody className="mt-2 text-sm text-muted-foreground">
        با حساب کاربری‌ات وارد شو تا پیشرفت یادگیری‌ات در دیتابیس ذخیره شود.
      </CardBody>

      {registered ? (
        <Alert variant="success" className="mt-4">ثبت‌نام موفق بود — حالا وارد شو.</Alert>
      ) : null}
      {state.error ? <Alert variant="error" className="mt-4">{state.error}</Alert> : null}

      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <Input name="email" type="email" label="ایمیل" placeholder="you@example.com" required autoComplete="email" dir="ltr" />
        <Input name="password" type="password" label="رمز عبور" placeholder="••••••••" required autoComplete="current-password" dir="ltr" />
        <Button type="submit" className="w-full" loading={pending}>ورود</Button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        حساب نداری؟{" "}
        <Link href="/register" className="text-primary hover:underline">ثبت‌نام کن</Link>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        کاربر مهمان؟ پیشرفت درس‌ها به‌صورت محلی در مرورگرت ذخیره می‌شود —{" "}
        <Link href="/courses" className="text-primary hover:underline">برو سراغ دوره‌ها</Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <PageEnter>
        <main className="mx-auto max-w-md px-4 py-16">
          <Suspense fallback={<div className="text-sm text-muted-foreground">در حال بارگذاری...</div>}>
            <LoginForm />
          </Suspense>
        </main>
      </PageEnter>
    </>
  );
}
