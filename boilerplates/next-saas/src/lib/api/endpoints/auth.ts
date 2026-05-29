import type { ApiUser, LoginResponse } from "@/types/api";
import { apiClient } from "../client";

export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
}): Promise<ApiUser> {
  return apiClient<ApiUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function refreshToken(token: string): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/auth/refresh", {
    method: "PATCH",
    token,
    credentials: "include",
  });
}

export async function logout(token: string): Promise<void> {
  return apiClient<void>("/auth/logout", {
    method: "PATCH",
    token,
  });
}
