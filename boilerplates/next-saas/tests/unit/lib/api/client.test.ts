import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient, ApiError } from "@/lib/api/client";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("apiClient", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns parsed JSON on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "1", username: "test" }),
    });

    const result = await apiClient<{ id: string; username: string }>("/users/me", {
      token: "abc",
    });

    expect(result.id).toBe("1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/me"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer abc" }),
      }),
    );
  });

  it("throws ApiError on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Unauthorized" }),
    });

    await expect(apiClient("/users/me")).rejects.toBeInstanceOf(ApiError);
  });

  it("returns undefined for 204 No Content", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: () => Promise.reject(new Error("no body")),
    });

    const result = await apiClient("/users/me", { method: "DELETE" });
    expect(result).toBeUndefined();
  });

  it("includes Content-Type header", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await apiClient("/health");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("ApiError has correct status and body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: "Not found" }),
    });

    try {
      await apiClient("/users/me");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(404);
    }
  });
});
