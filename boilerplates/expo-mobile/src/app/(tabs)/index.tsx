import { ScreenHeader } from "@/components/shared/screen-header";
import { Card } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 py-4">
        <ScreenHeader
          title={`Olá, ${user?.username ?? "Usuário"}`}
          subtitle="Bem-vindo ao painel"
        />
        <View className="gap-4">
          <Card>
            <Text className="text-sm font-medium text-muted-foreground">Email</Text>
            <Text className="mt-1 text-base font-semibold text-foreground">
              {user?.email ?? "—"}
            </Text>
          </Card>
          <Card>
            <Text className="text-sm font-medium text-muted-foreground">Função</Text>
            <Text className="mt-1 text-base font-semibold text-foreground capitalize">
              {user?.role ?? "—"}
            </Text>
          </Card>
          <Card>
            <Text className="text-sm font-medium text-muted-foreground">ID</Text>
            <Text className="mt-1 text-xs font-mono text-foreground">{user?.id ?? "—"}</Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
