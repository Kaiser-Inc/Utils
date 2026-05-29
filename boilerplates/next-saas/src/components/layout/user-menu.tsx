"use client";

import { Avatar } from "@/components/ui";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function UserMenu() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!user) return null;

  const displayName = user.username ?? user.email ?? "User";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-sm transition-colors hover:bg-[var(--bg-elevated)]"
      >
        <Avatar size="sm" fallback={displayName} />
        <span className="text-[var(--fg-2)] font-medium">{displayName}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-[var(--fg-4)] transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="animate-dropdown-in absolute right-0 top-full z-50 mt-1.5 w-48 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] py-1 shadow-lg">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-elevated)]"
          >
            <Settings className="h-4 w-4 text-[var(--fg-4)]" />
            Configurações
          </Link>
          <div className="my-1 border-t border-[var(--border-subtle)]" />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-[var(--danger-500)] transition-colors hover:bg-[var(--bg-elevated)]"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
