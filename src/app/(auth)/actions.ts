"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { registerUser, RegistrationError } from "@/server/services/auth-service";

export interface AuthFormState {
  error?: string;
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/dashboard");

  if (!email || !password) {
    return { error: "ایمیل و رمز عبور الزامی است." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "ایمیل یا رمز عبور اشتباه است." };
    }
    // Successful signIn throws a redirect — it must propagate.
    throw error;
  }
  return {};
}

export async function registerAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    await registerUser({ name, email, password });
  } catch (error) {
    if (error instanceof RegistrationError) {
      return { error: error.message };
    }
    console.error("[registerAction] unexpected error:", error);
    return { error: "خطای سرور در ثبت‌نام. دوباره تلاش کن." };
  }

  // Auto-login after successful registration.
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "ثبت‌نام موفق بود؛ اکنون وارد شو." };
    }
    throw error;
  }
  return {};
}
