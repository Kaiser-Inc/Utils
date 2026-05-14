import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function getSession(): Promise<Session | null> {
  return auth();
}
