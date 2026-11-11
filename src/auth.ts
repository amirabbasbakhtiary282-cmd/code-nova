import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { headers } from "next/headers";
import { compare } from "bcryptjs";
import { authConfig } from "@/auth.config";
import { getRepositories } from "@/server/repositories";

function forwardedPublicOrigin(requestHeaders: Headers): string | undefined {
  const protocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  const host = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  if ((protocol !== "http" && protocol !== "https") || !host) return undefined;

  try {
    const url = new URL(`${protocol}://${host}`);
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

async function requestAuthConfig(request?: Request) {
  // The preview terminates HTTPS before forwarding to Next. Use its forwarded
  // protocol consistently for Auth.js API handlers and server actions, or the
  // secure session cookie issued at sign-in cannot be cleared at sign-out.
  const requestHeaders = request?.headers ?? (await headers());
  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  const publicOrigin = forwardedPublicOrigin(requestHeaders);
  const useSecureCookies = process.env.NODE_ENV === "production" || forwardedProto === "https";

  return {
    ...authConfig,
    useSecureCookies,
    callbacks: {
      ...authConfig.callbacks,
      redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
        const safeBase = publicOrigin ?? baseUrl;
        try {
          const destination = new URL(url, safeBase);
          return destination.origin === safeBase ? destination.toString() : safeBase;
        } catch {
          return safeBase;
        }
      },
    },
    providers: [
      Credentials({
        name: "credentials",
        credentials: {
          email: { label: "ایمیل", type: "email" },
          password: { label: "رمز عبور", type: "password" },
        },
        async authorize(credentials) {
          const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
          const password = typeof credentials?.password === "string" ? credentials.password : "";
          if (!email || !password) return null;

          const user = await getRepositories().users.findByEmail(email);
          if (!user) return null;

          const passwordOk = await compare(password, user.passwordHash);
          if (!passwordOk) return null;

          return { id: String(user.id), name: user.name, email: user.email };
        },
      }),
    ],
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(requestAuthConfig);
