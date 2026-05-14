import { describe, it, expect, vi } from "vitest";

// Mock auth before import
vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { auth } from "@/lib/auth/auth";
import { requireAuth, getSession } from "@/lib/auth/session";

const mockAuth = vi.mocked(auth);

describe("requireAuth", () => {
  it("returns session when authenticated", async () => {
    const session = {
      user: { id: "1", username: "test", email: "t@t.com", role: "user" as const },
      accessToken: "tok",
      expires: "2099",
    };
    mockAuth.mockResolvedValueOnce(session as never);

    const result = await requireAuth();
    expect(result.accessToken).toBe("tok");
  });

  it("redirects to /login when unauthenticated", async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    await expect(requireAuth()).rejects.toThrow("REDIRECT:/login");
  });
});

describe("getSession", () => {
  it("returns null when no session", async () => {
    mockAuth.mockResolvedValueOnce(null as never);
    const result = await getSession();
    expect(result).toBeNull();
  });

  it("returns session when authenticated", async () => {
    const session = { user: { id: "1" }, accessToken: "tok", expires: "2099" };
    mockAuth.mockResolvedValueOnce(session as never);

    const result = await getSession();
    expect(result?.accessToken).toBe("tok");
  });
});
