import { Text, View } from "react-native";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
}

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <View className="mb-6">
      <Text className="text-2xl font-bold text-foreground">{title}</Text>
      {subtitle && <Text className="mt-1 text-sm text-muted-foreground">{subtitle}</Text>}
    </View>
  );
}
