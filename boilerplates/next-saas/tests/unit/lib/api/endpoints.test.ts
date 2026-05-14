import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerUser, refreshToken, logout } from "@/lib/api/endpoints/auth";
import { getProfile, updateProfile, deleteAccount } from "@/lib/api/endpoints/users";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function mockOk(data: unknown, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status,
    json: () => Promise.resolve(data),
  });
}

function mockError(status: number) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve({ error: "Error" }),
  });
}

const mockUser = {
  id: "1",
  username: "test",
  email: "test@example.com",
  role: "user",
  createdAt: "2024-01-01T00:00:00Z",
};

beforeEach(() => mockFetch.mockReset());

describe("auth endpoints", () => {
  it("registerUser — POST /auth/register", async () => {
    mockOk(mockUser, 201);
    const result = await registerUser({ username: "test", email: "t@t.com", password: "pass1234" });
    expect(result.id).toBe("1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/register"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("registerUser — throws on 409", async () => {
    mockError(409);
    await expect(
      registerUser({ username: "taken", email: "t@t.com", password: "pass1234" }),
    ).rejects.toThrow();
  });

  it("refreshToken — PATCH /auth/refresh", async () => {
    mockOk({ access_token: "new-token", token_type: "bearer" });
    const result = await refreshToken("old-token");
    expect(result.access_token).toBe("new-token");
  });

  it("logout — PATCH /auth/logout returns undefined", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: vi.fn() });
    const result = await logout("token");
    expect(result).toBeUndefined();
  });
});

describe("users endpoints", () => {
  it("getProfile — GET /users/me", async () => {
    mockOk(mockUser);
    const result = await getProfile("token");
    expect(result.email).toBe("test@example.com");
  });

  it("updateProfile — PUT /users/me", async () => {
    mockOk({ ...mockUser, username: "updated" });
    const result = await updateProfile("token", { username: "updated" });
    expect(result.username).toBe("updated");
  });

  it("deleteAccount — DELETE /users/me returns undefined", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: vi.fn() });
    const result = await deleteAccount("token");
    expect(result).toBeUndefined();
  });

  it("getProfile — throws on 401", async () => {
    mockError(401);
    await expect(getProfile("bad-token")).rejects.toThrow();
  });
});
