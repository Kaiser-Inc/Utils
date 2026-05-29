import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Skeleton,
} from "@/components/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { ToastDemo } from "./_toast-demo";

export const metadata: Metadata = { title: "Componentes" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <Separator className="mt-2" />
      </div>
      {children}
    </section>
  );
}

function ColorSwatch({ name, className, hex }: { name: string; className: string; hex: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className={`h-12 w-full rounded-[var(--radius)] border border-border ${className}`} />
      <p className="text-xs font-medium text-foreground">{name}</p>
      <p className="font-mono text-xs text-muted-foreground">{hex}</p>
    </div>
  );
}

export default function ComponentsPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-12 px-6 py-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Componentes</h1>
        <p className="mt-2 text-muted-foreground">
          Design system da KaiserInc — tokens, primitivos e composições.
        </p>
      </div>

      {/* Tipografia */}
      <Section title="Tipografia">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold">Heading 1 — text-4xl font-bold</h1>
          <h2 className="text-3xl font-semibold">Heading 2 — text-3xl font-semibold</h2>
          <h3 className="text-2xl font-semibold">Heading 3 — text-2xl font-semibold</h3>
          <h4 className="text-xl font-medium">Heading 4 — text-xl font-medium</h4>
          <h5 className="text-lg font-medium">Heading 5 — text-lg font-medium</h5>
          <p className="text-base">Parágrafo — text-base. Lorem ipsum dolor sit amet.</p>
          <p className="text-sm text-muted-foreground">
            Small / muted — text-sm text-muted-foreground
          </p>
          <code className="font-mono text-sm">Mono — font-mono text-sm</code>
        </div>
      </Section>

      {/* Paleta */}
      <Section title="Paleta de Cores">
        <p className="text-sm text-muted-foreground -mt-2">
          KaiserInc Design System — dark-first. Tokens canônicos + aliases shadcn-compat.
        </p>
        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Brand
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            <ColorSwatch name="brand / primary" className="bg-brand" hex="#8257E6" />
            <ColorSwatch name="brand-hover" className="bg-brand-hover" hex="#996DFF" />
            <ColorSwatch name="purple-800" className="bg-purple-800" hex="#402090" />
            <ColorSwatch name="success-300" className="bg-success-300" hex="#04D361" />
            <ColorSwatch name="warning-500" className="bg-warning-500" hex="#FBA94C" />
            <ColorSwatch name="danger-500 / destructive" className="bg-danger-500" hex="#F75A68" />
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Backgrounds (dark)
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ColorSwatch
              name="bg-base / background"
              className="bg-bg-base border border-border-strong"
              hex="#09090A"
            />
            <ColorSwatch
              name="bg-surface / card"
              className="bg-bg-surface border border-border-default"
              hex="#121214"
            />
            <ColorSwatch
              name="bg-elevated / muted"
              className="bg-bg-elevated border border-border-default"
              hex="#202024"
            />
            <ColorSwatch
              name="border-subtle / border"
              className="bg-border-subtle border border-border-default"
              hex="#202024"
            />
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Foregrounds (dark)
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <ColorSwatch name="fg-1 / foreground" className="bg-fg-1" hex="#FAFAFC" />
            <ColorSwatch name="fg-2" className="bg-fg-2" hex="#E1E1E6" />
            <ColorSwatch name="fg-3" className="bg-fg-3" hex="#8D8D99" />
            <ColorSwatch name="fg-4 / muted-fg" className="bg-fg-4" hex="#7C7C8A" />
            <ColorSwatch name="fg-5" className="bg-fg-5" hex="#505059" />
          </div>
        </div>
      </Section>

      {/* Botões */}
      <Section title="Botões">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default (primary)</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive (danger)</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button isLoading>Carregando</Button>
            <Button disabled>Desabilitado</Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Link via asChild</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Badges */}
      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="brand">Brand</Badge>
        </div>
      </Section>

      {/* Inputs */}
      <Section title="Inputs">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Normal" placeholder="Digite algo..." id="input-normal" />
          <Input
            label="Com descrição"
            description="Texto de ajuda abaixo do campo."
            placeholder="exemplo@email.com"
            id="input-desc"
          />
          <Input
            label="Com erro"
            error="Este campo é obrigatório."
            placeholder="Campo inválido"
            id="input-error"
          />
          <Input label="Desabilitado" placeholder="Não editável" disabled id="input-disabled" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="label-demo">Label standalone</Label>
          <p className="text-xs text-muted-foreground">Componente Label isolado com htmlFor.</p>
        </div>
      </Section>

      {/* Cards */}
      <Section title="Cards">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card Simples</CardTitle>
              <CardDescription>Subtítulo com muted-foreground.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Conteúdo do card.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Com Footer</CardTitle>
              <CardDescription>Card com ações no rodapé.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Corpo do card com informações.</p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Confirmar</Button>
              <Button size="sm" variant="outline">
                Cancelar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      {/* Alerts */}
      <Section title="Alerts">
        <div className="flex flex-col gap-3">
          <Alert variant="default" title="Informação">
            Mensagem informativa padrão do sistema.
          </Alert>
          <Alert variant="success" title="Sucesso">
            Operação realizada com sucesso.
          </Alert>
          <Alert variant="destructive" title="Erro">
            Ocorreu um erro ao processar a solicitação.
          </Alert>
          <Alert variant="warning" title="Atenção">
            Esta ação não pode ser desfeita.
          </Alert>
        </div>
      </Section>

      {/* Avatar */}
      <Section title="Avatar">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs text-muted-foreground mb-3">
              Iniciais extraídas do <code className="font-mono">fallback</code> — tamanhos: xs · sm
              · md (padrão) · lg · xl
            </p>
            <div className="flex items-end gap-3">
              <Avatar size="xs" fallback="Pedro Kaiser" />
              <Avatar size="sm" fallback="Pedro Kaiser" />
              <Avatar size="md" fallback="Pedro Kaiser" />
              <Avatar size="lg" fallback="Pedro Kaiser" />
              <Avatar size="xl" fallback="Pedro Kaiser" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar size="md" src="https://github.com/shadcn.png" alt="shadcn" fallback="Shad CN" />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium">Com imagem</p>
              <p className="text-xs text-muted-foreground">
                Fallback ativo se erro de carregamento
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar size="md" fallback="Kaiser Inc" />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium">Sem imagem</p>
              <p className="text-xs text-muted-foreground">
                Iniciais geradas a partir do nome completo
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Separator */}
      <Section title="Separator">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm">Horizontal</p>
            <Separator className="mt-2" />
          </div>
          <div className="flex h-10 items-center gap-4">
            <span className="text-sm">Item A</span>
            <Separator orientation="vertical" />
            <span className="text-sm">Item B</span>
            <Separator orientation="vertical" />
            <span className="text-sm">Item C</span>
          </div>
        </div>
      </Section>

      {/* Skeleton */}
      <Section title="Skeleton">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Toast */}
      <Section title="Toast / Notificações">
        <p className="text-sm text-muted-foreground -mt-2">
          Clique nos botões para disparar toasts. O Toaster está no Provider global (bottom-right).
        </p>
        <ToastDemo />
      </Section>

      {/* Animações */}
      <Section title="Animações">
        <div className="flex gap-4">
          <div className="animate-[fade-in_200ms_cubic-bezier(0.22,1,0.36,1)_forwards] rounded-[var(--radius)] border border-border bg-card p-4">
            <p className="text-sm font-medium">fade-in</p>
            <p className="text-xs text-muted-foreground">200ms ease-out</p>
          </div>
          <div className="animate-[slide-up_280ms_cubic-bezier(0.22,1,0.36,1)_forwards] rounded-[var(--radius)] border border-border bg-card p-4">
            <p className="text-sm font-medium">slide-up</p>
            <p className="text-xs text-muted-foreground">280ms ease-out + 8px Y</p>
          </div>
        </div>
      </Section>
    </main>
  );
}
