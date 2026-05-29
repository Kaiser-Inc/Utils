import { useAuth } from "@/lib/auth/auth-context";

export function useUser() {
  const { user, accessToken, isLoading } = useAuth();
  return { user, accessToken, isLoading };
}
