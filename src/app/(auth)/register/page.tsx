"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Header } from "@/components/layout/header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageEnter } from "@/components/ui/page-enter";
import { registerAction, type AuthFormState } from "../actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(registerAction, {});

  return (
    <>
      <Header />
      <PageEnter>
        <main className="mx-auto max-w-md px-4 py-16">
          <Card className="border-white/10 bg-surface/75">
            <CardTitle>ثبت‌نام</CardTitle>
            <CardBody className="mt-2 text-sm text-muted-foreground">
              حساب بساز تا پیشرفتت در درس‌ها و تمرین‌ها به‌صورت دائمی ذخیره شود و بین دستگاه‌ها همراهت بماند.
            </CardBody>

            {state.error ? <Alert variant="error" className="mt-4">{state.error}</Alert> : null}

            <form action={formAction} className="mt-5 space-y-4">
              <Input name="name" type="text" label="نام" placeholder="مثلاً سارا" required autoComplete="name" minLength={2} />
              <Input name="email" type="email" label="ایمیل" placeholder="you@example.com" required autoComplete="email" dir="ltr" />
              <Input
                name="password"
                type="password"
                label="رمز عبور"
                placeholder="حداقل ۸ نویسه"
                required
                autoComplete="new-password"
                minLength={8}
                dir="ltr"
                helper="رمز عبور با bcrypt هش می‌شود و به‌صورت خام ذخیره نمی‌گردد."
              />
              <Button type="submit" className="w-full" loading={pending}>ساخت حساب و ورود</Button>
            </form>

            <p className="mt-4 text-sm text-muted-foreground">
              قبلاً ثبت‌نام کرده‌ای؟{" "}
              <Link href="/login" className="text-primary hover:underline">وارد شو</Link>
            </p>
          </Card>
        </main>
      </PageEnter>
    </>
  );
}
