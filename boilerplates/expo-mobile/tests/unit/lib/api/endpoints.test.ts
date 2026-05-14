import { loginUser, registerUser, logout, refreshToken } from "@/lib/api/endpoints/auth";
import { getProfile, updateProfile, deleteAccount } from "@/lib/api/endpoints/users";
import { ApiError } from "@/lib/api/client";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => mockFetch.mockReset());

const ok = (data: unknown) => ({ ok: true, status: 200, json: async () => data });
const noContent = () => ({ ok: true, status: 204, json: async () => ({}) });
const err = (status: number) => ({ ok: false, status, json: async () => ({}) });

describe("auth endpoints", () => {
  it("loginUser posts to /auth/session", async () => {
    mockFetch.mockResolvedValue(ok({ access_token: "tok" }));
    const res = await loginUser({ email: "a@b.com", password: "pass" });
    expect(res.access_token).toBe("tok");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/session"),
      expect.any(Object),
    );
  });

  it("registerUser posts to /auth/register", async () => {
    mockFetch.mockResolvedValue(
      ok({ id: "1", username: "user", email: "a@b.com", role: "user" }),
    );
    const res = await registerUser({ username: "user", email: "a@b.com", password: "pass" });
    expect(res.id).toBe("1");
  });

  it("logout calls /auth/logout", async () => {
    mockFetch.mockResolvedValue(noContent());
    await expect(logout("tok")).resolves.toBeUndefined();
  });

  it("refreshToken calls /auth/refresh", async () => {
    mockFetch.mockResolvedValue(ok({ access_token: "new" }));
    const res = await refreshToken("old");
    expect(res.access_token).toBe("new");
  });

  it("loginUser throws ApiError on 401", async () => {
    mockFetch.mockResolvedValue(err(401));
    await expect(loginUser({ email: "a@b.com", password: "bad" })).rejects.toBeInstanceOf(
      ApiError,
    );
  });

  it("registerUser throws ApiError on 409", async () => {
    mockFetch.mockResolvedValue(err(409));
    await expect(
      registerUser({ username: "user", email: "a@b.com", password: "pass" }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe("user endpoints", () => {
  it("getProfile fetches /users/me", async () => {
    mockFetch.mockResolvedValue(ok({ id: "1", username: "u", email: "e@e.com", role: "user" }));
    const res = await getProfile("tok");
    expect(res.id).toBe("1");
  });

  it("updateProfile puts to /users/me", async () => {
    mockFetch.mockResolvedValue(
      ok({ id: "1", username: "new", email: "e@e.com", role: "user" }),
    );
    const res = await updateProfile("tok", { username: "new" });
    expect(res.username).toBe("new");
  });

  it("deleteAccount deletes /users/me", async () => {
    mockFetch.mockResolvedValue(noContent());
    await expect(deleteAccount("tok")).resolves.toBeUndefined();
  });

  it("getProfile sends Authorization header", async () => {
    mockFetch.mockResolvedValue(ok({ id: "1", username: "u", email: "e@e.com", role: "user" }));
    await getProfile("mytoken");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer mytoken" }),
      }),
    );
  });
});
