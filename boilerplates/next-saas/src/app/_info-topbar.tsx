"use client";

import { Button } from "@/components/ui";
import { TopBar } from "@kaiserinc/react";
import Link from "next/link";

export function InfoTopBar() {
  return (
    <TopBar
      title="next-saas"
      actions={
        <div className="flex items-center gap-2">
          <Link href="/components">
            <Button variant="ghost" size="sm">
              Componentes
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Começar</Button>
          </Link>
        </div>
      }
    />
  );
}
