import { cn } from "@/lib/utils";
import { Text, TextInput, type TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className="gap-1">
      {label && <Text className="text-sm font-medium text-foreground">{label}</Text>}
      <TextInput
        className={cn(
          "w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground",
          error && "border-destructive",
          className,
        )}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && <Text className="text-xs text-destructive">{error}</Text>}
    </View>
  );
}
