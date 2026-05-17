"use client";

/**
 * Card — re-exports @kaiserinc/react + aliases/overrides de compatibilidade
 *
 * KaiserInc: Card + CardHeader (flex-row) + CardTitle + CardBody
 *
 * Overrides:
 *   CardHeader → flex-col wrapper (o original KaiserInc é flex-row para icon+title;
 *                aqui mantemos o padrão title+description empilhados)
 *   CardContent = CardBody (alias)
 *   CardDescription, CardFooter — wrappers locais
 */
export { Card, CardBody, CardTitle } from "@kaiserinc/react";
export type { CardProps, CardBodyProps, CardTitleProps } from "@kaiserinc/react";

/** Alias de CardBody — mantém compatibilidade com imports existentes */
export { CardBody as CardContent } from "@kaiserinc/react";

import type { HTMLAttributes } from "react";

/**
 * CardHeader — override com flex-col (título + descrição empilhados).
 * O CardHeader nativo do @kaiserinc/react é flex-row (ícone + título lado a lado),
 * incompatível com o padrão de uso da boilerplate.
 */
export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["flex flex-col gap-1 mb-3", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

/** Subtítulo do card — texto muted abaixo do CardTitle */
export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={["text-sm text-[var(--fg-4)]", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </p>
  );
}

/** Rodapé do card — flex row com gap */
export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["flex items-center gap-2 pt-4", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
