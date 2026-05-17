"use client";

import { useUIStore } from "@/stores/ui-store";
import { Menu } from "lucide-react";
import { UserMenu } from "./user-menu";

export function Topbar() {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="flex h-14 items-center gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-base)] px-6">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="text-[var(--fg-4)] transition-colors hover:text-[var(--fg-1)]"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <UserMenu />
    </header>
  );
}
