import { apiClient, ApiError } from "@/lib/api/client";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => mockFetch.mockReset());

describe("apiClient", () => {
  it("returns parsed JSON on success", async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({ id: "1" }) });
    const result = await apiClient<{ id: string }>("/test");
    expect(result).toEqual({ id: "1" });
  });

  it("throws ApiError on non-ok response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: "Unauthorized" }),
    });
    await expect(apiClient("/test")).rejects.toBeInstanceOf(ApiError);
  });

  it("returns undefined on 204", async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204, json: async () => ({}) });
    const result = await apiClient("/test");
    expect(result).toBeUndefined();
  });

  it("sets Authorization header when token provided", async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    await apiClient("/test", { token: "mytoken" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer mytoken" }),
      }),
    );
  });

  it("ApiError exposes status", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 403, json: async () => ({}) });
    try {
      await apiClient("/test");
    } catch (err) {
      expect(err instanceof ApiError && err.status).toBe(403);
    }
  });

  it("does not set Authorization header when no token", async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    await apiClient("/test");
    const callArgs = mockFetch.mock.calls[0] as [string, { headers: Record<string, string> }];
    expect(callArgs[1].headers).not.toHaveProperty("Authorization");
  });
});
