import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config — imported by src/proxy.ts which runs in the
 * edge runtime and must NOT pull in Node-only modules (better-sqlite3,
 * bcryptjs). The Credentials provider (which needs the DB) is added only
 * in src/auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth: session, request }) {
      const { pathname } = request.nextUrl;
      const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/profile");
      if (!isProtected) return true;
      return Boolean(session?.user);
    },
    jwt({ token, user }) {
      if (user?.id) {
        token.userId = String(user.id);
      }
      return token;
    },
    session({ session, token }) {
      if (token.userId) {
        session.user.id = String(token.userId);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
