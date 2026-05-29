import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Animated, ScrollView, Text, View } from "react-native";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    try {
      await login(data.email, data.password);
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 401
          ? "Credenciais inválidas."
          : "Erro ao entrar. Tente novamente.";
      Alert.alert("Erro", msg);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="flex-grow justify-center px-6 py-12"
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View className="mb-8 items-center">
          <Logo size={72} />
          <Text className="mt-3 text-sm font-semibold tracking-wide">
            <Text className="text-foreground">Kaiser</Text>
            <Text className="text-[#8257e6]">Inc</Text>
          </Text>
        </View>

        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground">Entrar</Text>
          <Text className="mt-2 text-muted-foreground">Acesse sua conta</Text>
        </View>

        <View className="gap-4">
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
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Senha"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />
          <Button onPress={handleSubmit(onSubmit)} isLoading={isSubmitting}>
            Entrar
          </Button>
        </View>

        <View className="mt-6 flex-row justify-center gap-1">
          <Text className="text-muted-foreground">Não tem conta?</Text>
          <Text
            className="font-semibold text-primary"
            onPress={() => router.push("/(auth)/register")}
          >
            Registrar
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
