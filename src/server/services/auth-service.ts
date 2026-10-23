// Canonical registration logic — used by both the REST route
// (/api/register, consumed by the form and by E2E tests) and any future
// server action. Validation + hashing + audit live here, once.
import { hash } from "bcryptjs";
import { getRepositories } from "@/server/repositories";
import type { PublicUser } from "@/server/repositories";

export type RegistrationErrorCode = "invalid" | "exists";

export class RegistrationError extends Error {
  code: RegistrationErrorCode;
  constructor(code: RegistrationErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_ROUNDS = 10;

export function validateRegistrationInput(input: unknown): { name: string; email: string; password: string } {
  const body = (input ?? {}) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (name.length < 2) {
    throw new RegistrationError("invalid", "نام باید حداقل ۲ نویسه باشد.");
  }
  if (!EMAIL_RE.test(email)) {
    throw new RegistrationError("invalid", "ایمیل معتبر نیست.");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new RegistrationError("invalid", `رمز عبور باید حداقل ${MIN_PASSWORD_LENGTH} نویسه باشد.`);
  }
  return { name, email, password };
}

export async function registerUser(input: unknown): Promise<PublicUser> {
  const { name, email, password } = validateRegistrationInput(input);
  const repos = getRepositories();

  const existing = await repos.users.findByEmail(email);
  if (existing) {
    throw new RegistrationError("exists", "این ایمیل قبلاً ثبت شده است.");
  }

  const passwordHash = await hash(password, BCRYPT_ROUNDS);
  const user = await repos.users.createUser({ name, email, passwordHash });
  await repos.audit.log(user.id, "user.register", { email });

  return { id: user.id, name: user.name, email: user.email };
}
