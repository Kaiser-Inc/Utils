import { Providers } from "@/components/layout/providers";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../../global.css";

export default function RootLayout() {
  return (
    <Providers>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </Providers>
  );
}
