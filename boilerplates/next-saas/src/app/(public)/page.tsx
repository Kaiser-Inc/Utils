import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Início" };

export default function LandingPage() {
  return (
    <div className="text-center space-y-6 max-w-md px-4">
      <h1 className="text-4xl font-bold">KaiserInc SaaS</h1>
      <p className="text-muted-foreground">
        Boilerplate Next.js pronto para produção — auth, API client, métricas.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/login"
          className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="rounded-md border px-6 py-2.5 text-sm font-medium hover:bg-muted"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}
