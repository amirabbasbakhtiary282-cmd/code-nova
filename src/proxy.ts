import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Next 16 request proxy (successor of middleware.ts). Uses the edge-safe
// auth config: JWT session verification only — no DB access here.
// Protection rules live in authConfig.callbacks.authorized
// (/dashboard and /profile require a session; guests get redirected to /login).
export const { auth: proxy } = NextAuth(authConfig);

export default proxy;
