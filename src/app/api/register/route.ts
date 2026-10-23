import { NextResponse } from "next/server";
import { registerUser, RegistrationError } from "@/server/services/auth-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "بدنه درخواست JSON معتبر نیست." }, { status: 400 });
  }

  try {
    const user = await registerUser(body);
    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    if (error instanceof RegistrationError) {
      const status = error.code === "exists" ? 409 : 400;
      return NextResponse.json({ ok: false, error: error.message }, { status });
    }
    console.error("[register] unexpected error:", error);
    return NextResponse.json({ ok: false, error: "خطای سرور در ثبت‌نام." }, { status: 500 });
  }
}
