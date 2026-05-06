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
