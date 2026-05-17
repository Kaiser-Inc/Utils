"use client";

/**
 * Button — wrapper sobre @kaiserinc/react
 *
 * Mantém compatibilidade com API anterior:
 *   - variant="default"      → "primary"
 *   - variant="destructive"  → "danger"
 *   - isLoading              → loading
 *   - asChild                → Slot local (@radix-ui/react-slot)
 *   - size="icon"            → size="md" + classes h-10 w-10 p-0
 */
import { Button as KaisButton } from "@kaiserinc/react";
import { Slot } from "@radix-ui/react-slot";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type LegacyVariant = "default" | "outline" | "ghost" | "secondary" | "destructive";
type KaisVariant = "primary" | "outline" | "ghost" | "secondary" | "danger";
type LegacySize = "sm" | "md" | "lg" | "icon";
type KaisSize = "sm" | "md" | "lg";

const VARIANT_MAP: Record<LegacyVariant, KaisVariant> = {
  default: "primary",
  outline: "outline",
  ghost: "ghost",
  secondary: "secondary",
  destructive: "danger",
};

const SLOT_BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: LegacyVariant;
  size?: LegacySize;
  /** @deprecated use `loading` */
  isLoading?: boolean;
  loading?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, isLoading, loading, asChild = false, className, ...props }, ref) => {
    const isIcon = size === "icon";
    const kaisSize: KaisSize = isIcon ? "md" : ((size ?? "md") as KaisSize);
    const iconClass = isIcon ? "h-10 w-10 p-0" : undefined;
    const merged = [iconClass, className].filter(Boolean).join(" ") || undefined;

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={[SLOT_BASE, iconClass, className].filter(Boolean).join(" ")}
          {...props}
        />
      );
    }

    return (
      <KaisButton
        ref={ref}
        variant={VARIANT_MAP[variant ?? "default"]}
        size={kaisSize}
        loading={loading ?? isLoading}
        className={merged}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
