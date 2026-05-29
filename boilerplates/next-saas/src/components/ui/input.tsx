"use client";

/**
 * Input — re-export @kaiserinc/react com alias `description` → `hint`
 */
import { Input as KaisInput, type InputProps as KaisInputProps } from "@kaiserinc/react";
import { forwardRef } from "react";

interface InputProps extends Omit<KaisInputProps, "hint"> {
  /** @deprecated use `hint` */
  description?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ description, hint, ...props }, ref) => {
  return <KaisInput ref={ref} hint={hint ?? description} {...props} />;
});
Input.displayName = "Input";

export { Input };
export type { InputProps };
