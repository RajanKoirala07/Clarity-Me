import { getItem } from "./storage";

// Change this to your server's LAN IP when testing on a physical device.
// Do NOT use 'localhost' or '127.0.0.1' on a real device — it points to the phone itself.
export const BASE_URL = "http://localhost:9000/api/v1";
export const SERVER_URL = "http://localhost:9000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = await getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.message || data?.error || `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}

export const api = {
  post: <T>(path: string, body: unknown, requiresAuth = false) =>
    request<T>(
      path,
      { method: "POST", body: JSON.stringify(body) },
      requiresAuth,
    ),
  get: <T>(path: string, requiresAuth = false) =>
    request<T>(path, { method: "GET" }, requiresAuth),
};
