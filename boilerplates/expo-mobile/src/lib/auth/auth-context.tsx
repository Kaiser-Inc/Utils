import { loginUser, logout as logoutApi, registerUser } from "@/lib/api/endpoints/auth";
import { getProfile } from "@/lib/api/endpoints/users";
import type { ApiUser } from "@/types/api";
import { type ReactNode, createContext, useContext, useEffect, useState } from "react";
import { getToken, removeToken, setToken } from "./token-storage";

interface AuthState {
  user: ApiUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadToken() {
      try {
        const stored = await getToken();
        if (stored) {
          setAccessToken(stored);
          const profile = await getProfile(stored);
          setUser(profile);
        }
      } catch {
        await removeToken();
      } finally {
        setIsLoading(false);
      }
    }
    void loadToken();
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const { access_token } = await loginUser({ email, password });
    await setToken(access_token);
    setAccessToken(access_token);
    const profile = await getProfile(access_token);
    setUser(profile);
  }

  async function logout(): Promise<void> {
    if (accessToken) {
      try {
        await logoutApi(accessToken);
      } catch {
      }
    }
    await removeToken();
    setAccessToken(null);
    setUser(null);
  }

  async function register(username: string, email: string, password: string): Promise<void> {
    await registerUser({ username, email, password });
    await login(email, password);
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
