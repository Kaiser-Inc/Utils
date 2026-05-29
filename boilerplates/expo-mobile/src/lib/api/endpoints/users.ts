import type { ApiUser } from "@/types/api";
import { apiClient } from "../client";

export async function getProfile(token: string): Promise<ApiUser> {
  return apiClient<ApiUser>("/users/me", { token });
}

export async function updateProfile(
  token: string,
  data: { username?: string; email?: string },
): Promise<ApiUser> {
  return apiClient<ApiUser>("/users/me", {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

export async function deleteAccount(token: string): Promise<void> {
  return apiClient<void>("/users/me", { method: "DELETE", token });
}
