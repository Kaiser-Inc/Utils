/**
 * Input — NativeWind local, atualizado com semantic tokens de @kaiserinc/react-native
 *
 * Mantém suporte a leadingIcon/trailingIcon (não disponível em @kaiserinc/react-native).
 * Alias: description → hint (prop KaiserInc).
 */
import { cn } from "@/lib/utils";
import { semantic } from "@kaiserinc/react-native";
import type { LucideIcon } from "lucide-react-native";
import { Text, TextInput, type TextInputProps, View } from "react-native";

type IconComponent = LucideIcon;

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  /** @deprecated use `hint` */
  description?: string;
  hint?: string;
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  onTrailingIconPress?: () => void;
  className?: string;
}

export function Input({
  label,
  error,
  description,
  hint,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  onTrailingIconPress,
  className,
  ...props
}: InputProps) {
  const hintText = hint ?? description;

  return (
    <View className="gap-1.5">
      {label && <Text className="text-sm font-medium text-foreground">{label}</Text>}
      <View className="relative flex-row items-center">
        {LeadingIcon && (
          <View className="absolute left-3 z-10">
            <LeadingIcon size={16} color={semantic.fg3} />
          </View>
        )}
        <TextInput
          className={cn(
            "h-11 w-full flex-1 rounded-lg border border-border bg-background text-sm text-foreground",
            LeadingIcon ? "pl-10 pr-4" : "px-4",
            TrailingIcon ? "pr-10" : "",
            error && "border-destructive",
            className as string,
          )}
          placeholderTextColor={semantic.fg4}
          {...props}
        />
        {TrailingIcon && (
          <View className="absolute right-3 z-10">
            <TrailingIcon size={16} color={semantic.fg3} />
          </View>
        )}
      </View>
      {hintText && !error && <Text className="text-xs text-muted-foreground">{hintText}</Text>}
      {error && <Text className="text-xs text-destructive">{error}</Text>}
    </View>
  );
}
