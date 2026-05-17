"use client";

import { Alert, Button, Input } from "@/components/ui";
import { useUser } from "@/hooks/use-user";
import { ApiError } from "@/lib/api/client";
import { updateProfile } from "@/lib/api/endpoints/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const settingsSchema = z.object({
  username: z.string().min(3).max(50).optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { user, accessToken } = useUser();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsForm>({ resolver: zodResolver(settingsSchema) });

  async function onSubmit(data: SettingsForm) {
    if (!accessToken) return;
    setMessage(null);

    const payload = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== "")) as {
      username?: string;
      email?: string;
    };

    if (Object.keys(payload).length === 0) {
      setMessage({ type: "error", text: "Preencha ao menos um campo." });
      return;
    }

    try {
      await updateProfile(accessToken, payload);
      setMessage({ type: "success", text: "Perfil atualizado com sucesso." });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setMessage({ type: "error", text: "Email ou username já em uso." });
      } else {
        setMessage({ type: "error", text: "Erro ao atualizar. Tente novamente." });
      }
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="text-muted-foreground">Atualize seu perfil</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="username"
          type="text"
          label="Usuário"
          placeholder={user?.username ?? ""}
          error={errors.username?.message}
          {...register("username")}
        />

        <Input
          id="email"
          type="email"
          label="Email"
          placeholder={user?.email ?? ""}
          error={errors.email?.message}
          {...register("email")}
        />

        {message && (
          <Alert variant={message.type === "success" ? "success" : "danger"}>{message.text}</Alert>
        )}

        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? "Salvando…" : "Salvar alterações"}
        </Button>
      </form>
    </div>
  );
}
