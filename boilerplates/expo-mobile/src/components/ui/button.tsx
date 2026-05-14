import { cn } from "@/lib/utils";
import { Pressable, type PressableProps, Text } from "react-native";

interface ButtonProps extends PressableProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: string;
  isLoading?: boolean;
  className?: string;
}

export function Button({
  variant = "default",
  size = "md",
  children,
  isLoading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const base = "items-center justify-center rounded-lg";
  const variants = {
    default: "bg-primary",
    outline: "border border-primary bg-transparent",
    ghost: "bg-transparent",
  };
  const sizes = {
    sm: "px-3 py-1.5",
    md: "px-5 py-2.5",
    lg: "px-6 py-3.5",
  };
  const textColors = {
    default: "text-white",
    outline: "text-primary",
    ghost: "text-primary",
  };

  return (
    <Pressable
      className={cn(
        base,
        variants[variant],
        sizes[size],
        (disabled || isLoading) && "opacity-50",
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      <Text className={cn("font-semibold text-base", textColors[variant])}>
        {isLoading ? "Carregando…" : children}
      </Text>
    </Pressable>
  );
}
