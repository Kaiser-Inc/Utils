import type { ApiUser, LoginResponse } from "@/types/api";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3000";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const res = await fetch(`${backendUrl}/auth/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) return null;

        const { access_token } = (await res.json()) as LoginResponse;

        const profileRes = await fetch(`${backendUrl}/users/me`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!profileRes.ok) return null;

        const user = (await profileRes.json()) as ApiUser;

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          accessToken: access_token,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.id as string;
      session.user.username = token.username as string;
      session.user.role = token.role as "user" | "admin";
      return session;
    },
  },
  session: { strategy: "jwt" },
});
