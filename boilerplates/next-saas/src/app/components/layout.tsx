import Link from "next/link";
import type { ReactNode } from "react";

export default function ComponentsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b border-border bg-background/80 backdrop-blur-sm px-6">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← KaiserInc SaaS
        </Link>
        <span className="ml-auto text-xs text-muted-foreground">Design System</span>
      </header>
      {children}
    </div>
  );
}
