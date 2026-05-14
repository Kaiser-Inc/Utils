"use client";

import { ApiError } from "@/lib/api/client";
import { registerUser } from "@/lib/api/endpoints/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres").max(50),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterForm) {
    setError(null);
    try {
      await registerUser(data);
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Email ou username já em uso.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6 rounded-xl border bg-background p-8 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Criar conta</h1>
        <p className="text-sm text-muted-foreground">Junte-se ao KaiserInc</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {(["username", "email", "password"] as const).map((field) => (
          <div key={field} className="space-y-1">
            <label htmlFor={field} className="text-sm font-medium capitalize">
              {field === "username" ? "Usuário" : field === "email" ? "Email" : "Senha"}
            </label>
            <input
              id={field}
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              {...register(field)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors[field] && <p className="text-xs text-red-500">{errors[field]?.message}</p>}
          </div>
        ))}

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? "Criando…" : "Criar conta"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
