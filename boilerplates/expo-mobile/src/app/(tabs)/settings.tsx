import { ScreenHeader } from "@/components/shared/screen-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/use-user";
import { ApiError } from "@/lib/api/client";
import { updateProfile } from "@/lib/api/endpoints/users";
import { useAuth } from "@/lib/auth/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const settingsSchema = z.object({
  username: z.string().min(3).max(50).optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});
type SettingsForm = z.infer<typeof settingsSchema>;

export default function SettingsScreen() {
  const { logout, accessToken } = useAuth();
  const { user } = useUser();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  });

  async function onSubmit(data: SettingsForm) {
    if (!accessToken) return;
    const payload = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== "")) as {
      username?: string;
      email?: string;
    };
    if (Object.keys(payload).length === 0) {
      Alert.alert("Atenção", "Preencha ao menos um campo.");
      return;
    }
    try {
      await updateProfile(accessToken, payload);
      Alert.alert("Sucesso", "Perfil atualizado.");
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 409
          ? "Email ou usuário já em uso."
          : "Erro ao atualizar. Tente novamente.";
      Alert.alert("Erro", msg);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 py-4">
        <ScreenHeader title="Configurações" subtitle="Atualize seu perfil" />
        <View className="gap-4">
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Usuário"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                placeholder={user?.username}
                error={errors.username?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder={user?.email}
                error={errors.email?.message}
              />
            )}
          />
          <Button onPress={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            Salvar alterações
          </Button>
          <Button
            variant="outline"
            onPress={() =>
              Alert.alert("Sair", "Deseja sair da conta?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", style: "destructive", onPress: logout },
              ])
            }
          >
            Sair
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
