"use client";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { LayoutDashboard, LogOut, Palette, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/components", label: "Componentes", icon: Palette },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();

  return (
    <div className="sidebar-wrapper h-full" data-open={sidebarOpen ? "true" : "false"}>
      <div className="sidebar-inner h-full">
        <aside className="flex h-full w-64 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <div className="flex h-14 items-center border-b border-[var(--border-subtle)] px-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/logo-kaiser.png"
                alt="KaiserInc"
                width={28}
                height={28}
                className="transition-opacity group-hover:opacity-80"
              />
              <span className="font-semibold text-sm tracking-wide">
                <span className="text-[var(--fg-1)]">Kaiser</span>
                <span className="text-[var(--brand)]">Inc</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 space-y-0.5 p-3">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-[var(--brand-subtle)] text-[var(--brand)]"
                      : "text-[var(--fg-3)] hover:bg-[var(--bg-elevated)] hover:text-[var(--fg-1)]",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      active
                        ? "text-[var(--brand)]"
                        : "text-[var(--fg-4)] group-hover:text-[var(--fg-2)]",
                    )}
                  />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[var(--border-subtle)] p-3">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="group flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--fg-3)] transition-all duration-150 hover:bg-[var(--bg-elevated)] hover:text-[var(--danger-500)]"
            >
              <LogOut className="h-4 w-4 text-[var(--fg-4)] transition-colors group-hover:text-[var(--danger-500)]" />
              Sair
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
