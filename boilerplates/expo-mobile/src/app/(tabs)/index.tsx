import { ScreenHeader } from "@/components/shared/screen-header";
import { Card } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { Fingerprint, Mail, Shield } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useUser();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 py-4">
        <ScreenHeader
          title={`Olá, ${user?.username ?? "Usuário"}`}
          subtitle="Bem-vindo ao painel"
        />
        <Animated.View
          className="gap-4"
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <Card>
            <View className="mb-2 flex-row items-center gap-2">
              <Mail size={15} color="#71717a" />
              <Text className="text-sm font-medium text-muted-foreground">Email</Text>
            </View>
            <Text className="text-base font-semibold text-foreground">{user?.email ?? "—"}</Text>
          </Card>
          <Card>
            <View className="mb-2 flex-row items-center gap-2">
              <Shield size={15} color="#71717a" />
              <Text className="text-sm font-medium text-muted-foreground">Função</Text>
            </View>
            <Text className="text-base font-semibold capitalize text-foreground">
              {user?.role ?? "—"}
            </Text>
          </Card>
          <Card>
            <View className="mb-2 flex-row items-center gap-2">
              <Fingerprint size={15} color="#71717a" />
              <Text className="text-sm font-medium text-muted-foreground">ID</Text>
            </View>
            <Text className="font-mono text-xs text-foreground">{user?.id ?? "—"}</Text>
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
