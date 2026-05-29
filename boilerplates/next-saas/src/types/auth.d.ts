import type { DefaultJWT, DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken: string;
    user: {
      id: string;
      username: string;
      email: string;
      role: "user" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    email: string;
    role: "user" | "admin";
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken: string;
    id: string;
    username: string;
    role: "user" | "admin";
  }
}
