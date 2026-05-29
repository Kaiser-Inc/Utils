"use client";

/**
 * Alert — wrapper sobre @kaiserinc/react
 *
 * Mapeamento de variants:
 *   - "default"     → "info"
 *   - "destructive" → "danger"
 *   - "success" / "warning" → passthrough
 *
 * API KaiserInc: <Alert title="..." variant="info|success|warning|danger">descrição</Alert>
 *
 * AlertTitle / AlertDescription exportados como stubs para compat com showcase antigo
 * (showcase atualizado usa title prop diretamente).
 */
import { Alert as KaisAlert, type AlertProps as KaisAlertProps } from "@kaiserinc/react";
import type { HTMLAttributes } from "react";

type LegacyVariant = "default" | "destructive" | "success" | "warning";
type KaisVariant = "info" | "danger" | "success" | "warning";

const VARIANT_MAP: Record<LegacyVariant, KaisVariant> = {
  default: "info",
  destructive: "danger",
  success: "success",
  warning: "warning",
};

interface AlertProps extends Omit<KaisAlertProps, "variant"> {
  variant?: LegacyVariant | KaisVariant;
}

function Alert({ variant = "default", ...props }: AlertProps) {
  const mapped =
    variant in VARIANT_MAP ? VARIANT_MAP[variant as LegacyVariant] : (variant as KaisVariant);
  return <KaisAlert variant={mapped} {...props} />;
}

/** Stub — mantém imports legados sem quebrar. Não renderiza nada. */
function AlertTitle(_: HTMLAttributes<HTMLHeadingElement>) {
  return null;
}

/** Stub — mantém imports legados sem quebrar. Não renderiza nada. */
function AlertDescription(_: HTMLAttributes<HTMLParagraphElement>) {
  return null;
}

export { Alert, AlertDescription, AlertTitle };
export type { AlertProps };
