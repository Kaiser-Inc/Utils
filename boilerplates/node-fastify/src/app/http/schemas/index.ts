import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  role: z.enum(["user", "admin"]),
  createdAt: z.date(),
});

export const AccessTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
});

export const ErrorSchema = z.object({
  error: z.string(),
});

export const HealthSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string(),
});

// ─── Request Body Schemas ─────────────────────────────────────────────────────

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RegisterBodySchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

export const UpdateProfileBodySchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
});
