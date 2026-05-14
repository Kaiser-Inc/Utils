"use client";

import { useUser } from "@/hooks/use-user";
import { useUIStore } from "@/stores/ui-store";
import { Menu } from "lucide-react";

export function Topbar() {
  const { toggleSidebar } = useUIStore();
  const { user } = useUser();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="text-muted-foreground hover:text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      {user && <span className="text-sm text-muted-foreground">{user.username ?? user.email}</span>}
    </header>
  );
}
