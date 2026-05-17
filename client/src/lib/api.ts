const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface ApiOptions extends RequestInit {
  body?: unknown;
}

export async function api<T = unknown>(
  path: string,
  options?: ApiOptions,
): Promise<T> {
  const { body, ...rest } = options || {};

  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || res.statusText);
  }

  return res.json() as Promise<T>;
}
