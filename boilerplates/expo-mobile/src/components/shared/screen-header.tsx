import type { ReactNode } from "react";
import { Text, View } from "react-native";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
}

export function ScreenHeader({ title, subtitle, rightSlot }: ScreenHeaderProps) {
  return (
    <View className="mb-6 flex-row items-start justify-between">
      <View className="flex-1">
        <Text className="text-2xl font-bold text-foreground">{title}</Text>
        {subtitle && <Text className="mt-1 text-sm text-muted-foreground">{subtitle}</Text>}
      </View>
      {rightSlot && <View className="ml-4">{rightSlot}</View>}
    </View>
  );
}
