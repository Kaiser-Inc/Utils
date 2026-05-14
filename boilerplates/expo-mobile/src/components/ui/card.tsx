import { cn } from "@/lib/utils";
import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)}
      {...props}
    >
      {children}
    </View>
  );
}
