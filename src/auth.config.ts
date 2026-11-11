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
      if (!isProtected || session?.user) return true;

      // When TLS terminates at the preview/reverse proxy, Next's internal URL
      // can be 0.0.0.0. Build the login redirect from forwarded public headers
      // so the browser never receives an internal callback host.
      const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
      const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
      let origin = request.nextUrl.origin;
      if (host && (protocol === "http" || protocol === "https")) {
        try {
          const forwardedUrl = new URL(`${protocol}://${host}`);
          if (!forwardedUrl.username && !forwardedUrl.password && forwardedUrl.pathname === "/") {
            origin = forwardedUrl.origin;
          }
        } catch {
          // Fall back to Next's request origin if the proxy header is malformed.
        }
      }

      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("callbackUrl", new URL(`${pathname}${request.nextUrl.search}`, origin).toString());
      return Response.redirect(loginUrl, 307);
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
