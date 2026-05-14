export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API error ${status}`);
    this.name = "ApiError";
  }
}

type RequestOptions = RequestInit & {
  token?: string;
};

function getBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.BACKEND_URL ?? "http://localhost:3000";
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
