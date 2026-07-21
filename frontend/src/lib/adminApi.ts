/**
 * Admin API client — semua request ke backend CMS
 * Base URL dari env: VITE_API_URL (default: http://localhost:3000)
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function getToken(): string | null {
  return localStorage.getItem("admin_token");
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let reqBody: any = body;
  if (body instanceof FormData) {
    reqBody = body;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    reqBody = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: reqBody,
  });

  if (res.status === 401) {
    // Jangan langsung redirect di sini — biarkan AdminAuthContext yang handle
    // setelah mencoba refresh token. Cukup throw error 401.
    const errObj: any = new Error("Unauthorized");
    errObj.status = 401;
    throw errObj;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const errObj: any = new Error(err.message ?? "Request failed");
    errObj.status = res.status;
    throw errObj;
  }

  return res.json();
}

export const adminApi = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
