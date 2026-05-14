import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-svh items-center justify-center bg-muted/40">{children}</div>;
}
