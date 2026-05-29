import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/dashboard",
  redirect: vi.fn(),
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: { id: "1", username: "testuser", email: "test@example.com", role: "user" },
      accessToken: "mock-token",
    },
    status: "authenticated",
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));
