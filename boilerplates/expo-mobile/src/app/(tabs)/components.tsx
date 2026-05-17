import { ScreenHeader } from "@/components/shared/screen-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Lock, Mail, Search } from "lucide-react-native";
import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mb-8">
      <Text className="mb-1 text-lg font-semibold text-foreground">{title}</Text>
      <View className="mb-3 h-px w-full bg-border" />
      {children}
    </View>
  );
}

interface SwatchProps {
  name: string;
  hex: string;
  className: string;
}

function ColorSwatch({ name, hex, className }: SwatchProps) {
  return (
    <View className="mb-2 mr-2 items-center">
      <View className={`h-10 w-20 rounded-lg border border-border ${className}`} />
      <Text className="mt-1 text-xs font-medium text-foreground">{name}</Text>
      <Text className="font-mono text-xs text-muted-foreground">{hex}</Text>
    </View>
  );
}

export default function ComponentsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Componentes" subtitle="KaiserInc Design System" />

        <Section title="Tipografia">
          <Text className="text-3xl font-bold text-foreground">Heading 1</Text>
          <Text className="text-2xl font-semibold text-foreground">Heading 2</Text>
          <Text className="text-xl font-medium text-foreground">Heading 3</Text>
          <Text className="text-base text-foreground">Parágrafo — text-base</Text>
          <Text className="text-sm text-muted-foreground">Small / muted</Text>
        </Section>

        <Section title="Paleta de Cores">
          <View className="flex-row flex-wrap">
            <ColorSwatch name="primary" hex="#8257E6" className="bg-primary" />
            <ColorSwatch name="secondary" hex="#04D361" className="bg-secondary" />
            <ColorSwatch name="destructive" hex="#EF4444" className="bg-destructive" />
            <ColorSwatch name="foreground" hex="#0F172A" className="bg-foreground" />
            <ColorSwatch name="card" hex="#F8FAFC" className="bg-card" />
            <ColorSwatch name="muted" hex="#F1F5F9" className="bg-muted" />
            <ColorSwatch name="border" hex="#E2E8F0" className="bg-border" />
          </View>
        </Section>

        <Section title="Botões">
          <View className="gap-3">
            <View className="flex-row flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </View>
            <View className="flex-row flex-wrap gap-2">
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
            </View>
            <View className="flex-row flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </View>
            <View className="flex-row flex-wrap gap-2">
              <Button leftIcon={Mail}>Com ícone</Button>
              <Button rightIcon={Search} variant="outline">
                Buscar
              </Button>
            </View>
            <View className="flex-row flex-wrap gap-2">
              <Button isLoading>Carregando</Button>
              <Button disabled>Desabilitado</Button>
            </View>
          </View>
        </Section>

        <Section title="Badges">
          <View className="flex-row flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="brand">Brand</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
          </View>
        </Section>

        <Section title="Avatar">
          <View className="flex-row flex-wrap gap-4 items-center">
            <Avatar name="Pedro Henrique" size="xs" />
            <Avatar name="Pedro Henrique" size="sm" />
            <Avatar name="Pedro Henrique" size="md" />
            <Avatar name="Pedro Henrique" size="lg" />
            <Avatar name="Pedro Henrique" size="xl" />
          </View>
        </Section>

        <Section title="Inputs">
          <View className="gap-4">
            <Input label="Normal" placeholder="Digite algo..." />
            <Input
              label="Com descrição"
              description="Texto de ajuda abaixo."
              placeholder="exemplo@email.com"
            />
            <Input label="Com ícone" leadingIcon={Mail} placeholder="email@exemplo.com" />
            <Input
              label="Senha"
              leadingIcon={Lock}
              trailingIcon={Eye}
              placeholder="••••••••"
              secureTextEntry
            />
            <Input
              label="Com erro"
              error="Este campo é obrigatório."
              placeholder="Campo inválido"
            />
            <Input label="Desabilitado" placeholder="Não editável" editable={false} />
          </View>
        </Section>

        <Section title="Cards">
          <View className="gap-4">
            <Card>
              <CardHeader>
                <Text className="text-base font-semibold text-foreground">Card Simples</Text>
                <Text className="text-sm text-muted-foreground">Subtítulo do card</Text>
              </CardHeader>
              <CardContent>
                <Text className="text-sm text-muted-foreground">Conteúdo com padding correto.</Text>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Text className="text-base font-semibold text-foreground">Com Footer</Text>
                <Text className="text-sm text-muted-foreground">Ações no rodapé.</Text>
              </CardHeader>
              <CardContent>
                <Text className="text-sm text-muted-foreground">
                  Corpo com informações relevantes.
                </Text>
              </CardContent>
              <CardFooter>
                <Button size="sm">Confirmar</Button>
                <Button size="sm" variant="outline">
                  Cancelar
                </Button>
              </CardFooter>
            </Card>
          </View>
        </Section>

        <Section title="Skeleton">
          <View className="gap-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
            <Card>
              <CardHeader>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          </View>
        </Section>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
