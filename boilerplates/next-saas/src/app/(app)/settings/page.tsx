"use client";

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
        <div className="space-y-1">
          <label htmlFor="username" className="text-sm font-medium">
            Usuário
          </label>
          <input
            id="username"
            type="text"
            placeholder={user?.username ?? ""}
            {...register("username")}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder={user?.email ?? ""}
            {...register("email")}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {message && (
          <p
            className={`rounded-md px-3 py-2 text-sm ${
              message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? "Salvando…" : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
