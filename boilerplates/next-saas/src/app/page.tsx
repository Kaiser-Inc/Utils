import { Footer } from "@/components/layout/footer";
import { Logo } from "@/components/shared/logo";
import { Badge, Button } from "@/components/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { InfoTopBar } from "./_info-topbar";

export const metadata: Metadata = {
  title: "KaiserInc Next.js SaaS Boilerplate",
  description:
    "Boilerplate de produção para SaaS: autenticação, design system KaiserInc, Tailwind v4 e estrutura de rotas pronta.",
};

const FEATURES = [
  {
    title: "Autenticação completa",
    description:
      "NextAuth v5 com JWT, sessão persistente, rotas protegidas e guard de permissões. Login e registro prontos.",
  },
  {
    title: "Design System KaiserInc",
    description:
      "@kaiserinc/react v0.2 — Button, Card, Alert, Badge, Input, Avatar, Skeleton, Toast e mais. Dark-first por padrão.",
  },
  {
    title: "Tailwind v4 + tokens CSS",
    description:
      "Tema completo com variáveis CSS semânticas (--brand, --fg-1…5, --bg-base/surface/elevated). Suporte a light e dark mode.",
  },
  {
    title: "API layer tipada",
    description:
      "Axios com interceptors, refresh token automático e tipagem por endpoint. Fácil de extender para qualquer backend REST.",
  },
  {
    title: "React Query",
    description:
      "TanStack Query v5 configurado com stale time, retry e devtools em desenvolvimento.",
  },
  {
    title: "Qualidade de código",
    description:
      "Biome para lint e format, Vitest para testes unitários, TypeScript strict mode e path aliases configurados.",
  },
];

const STACK = [
  { name: "Next.js 15", tag: "framework" },
  { name: "TypeScript 5", tag: "linguagem" },
  { name: "Tailwind v4", tag: "estilo" },
  { name: "@kaiserinc/react", tag: "design system" },
  { name: "NextAuth v5", tag: "autenticação" },
  { name: "TanStack Query v5", tag: "estado servidor" },
  { name: "Axios", tag: "http" },
  { name: "Biome", tag: "qualidade" },
  { name: "Vitest", tag: "testes" },
  { name: "pnpm", tag: "pacotes" },
];

export default function InfoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <InfoTopBar />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-20 px-6 py-24">
        <section className="space-y-6 text-center">
          <div className="flex justify-center">
            <Logo size={340} />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="brand">Next.js 15</Badge>
            <Badge variant="default">TypeScript</Badge>
            <Badge variant="default">Tailwind v4</Badge>
            <Badge variant="default">@kaiserinc/react</Badge>
          </div>
          <h1 className="text-4xl font-bold">KaiserInc Next.js SaaS Boilerplate</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Ponto de partida de produção para aplicações SaaS. Autenticação, design system,
            estrutura de rotas e padrões de código prontos para escalar.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/login">
              <Button size="lg">Acessar Demo</Button>
            </Link>
            <Link href="/components">
              <Button variant="outline" size="lg">
                Ver Componentes
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">O que está incluído</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-[var(--radius-xl)] border border-border bg-card p-5 space-y-1.5"
              >
                <p className="font-medium">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stack */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Stack técnica</h2>
          <div className="flex flex-wrap gap-3">
            {STACK.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-card px-3 py-2"
              >
                <span className="text-sm font-medium">{s.name}</span>
                <span className="font-mono text-xs text-muted-foreground">{s.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Como usar */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Como usar</h2>
          <ol className="space-y-5 text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                1
              </span>
              <span>Clone o repositório e instale as dependências.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                2
              </span>
              <span>
                Copie <code className="font-mono text-sm text-foreground">.env.example</code> para{" "}
                <code className="font-mono text-sm text-foreground">.env.local</code> e configure as
                variáveis (NEXTAUTH_SECRET, NEXTAUTH_URL, API_URL).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                3
              </span>
              <span>
                Conecte ao seu backend REST substituindo os endpoints em{" "}
                <code className="font-mono text-sm text-foreground">src/lib/api/</code>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                4
              </span>
              <span>Adicione suas rotas e páginas em cima da estrutura existente.</span>
            </li>
          </ol>
          <pre className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-card p-4 font-mono text-sm">
            {`git clone <repo> meu-projeto
cd meu-projeto
pnpm install
cp .env.example .env.local
pnpm dev`}
          </pre>
        </section>

        {/* Estrutura */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Estrutura de diretórios</h2>
          <pre className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-card p-4 font-mono text-sm text-muted-foreground">
            {`src/
├── app/
│   ├── (app)/          # Rotas autenticadas (dashboard, settings)
│   ├── (public)/       # Rotas públicas (login, register)
│   └── components/     # Showcase do design system
├── components/
│   ├── layout/         # Sidebar, Topbar, Providers, Footer
│   └── ui/             # Wrappers sobre @kaiserinc/react
├── hooks/              # React hooks (useUser, etc.)
├── lib/
│   ├── api/            # Endpoints e cliente Axios
│   └── auth/           # Configuração NextAuth
└── stores/             # Zustand stores (ui-store)`}
          </pre>
        </section>
      </main>

      <Footer />
    </div>
  );
}
