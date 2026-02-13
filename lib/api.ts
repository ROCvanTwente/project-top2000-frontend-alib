export async function apiFetch(
  input: RequestInfo,
  init: RequestInit = {},
  options?: { suppressUnauthorized?: boolean }
): Promise<Response> {
  const API = process.env.NEXT_PUBLIC_API_URL || "";
  const url = typeof input === "string" && input.startsWith("/") ? `${API}${input}` : input;
  const token = typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null;

  const headers = new Headers(init.headers as HeadersInit || {});
  if (!headers.get("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  // perform the request
  let res = await fetch(url, { ...init, headers });

  // If unauthorized, attempt to refresh token once (if refresh token present)
  if (res.status === 401 && typeof window !== "undefined") {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        // Attempt token refresh
        const refreshRes = await fetch(typeof API === "string" ? `${API}/auth/refresh-token` : "/auth/refresh-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json().catch(() => ({}));
          const newToken = data.token || data.accessToken || data.access_token;
          const newRefresh = data.refreshToken || data.refresh_token || data.refresh;
          const expiresAt = data.expiresAt || data.expires_at || data.expires;

          if (newToken) {
            // persist new tokens
            localStorage.setItem("jwtToken", newToken);
            if (newRefresh) localStorage.setItem("refreshToken", newRefresh);
            if (expiresAt) localStorage.setItem("expiresAt", String(expiresAt));

            // notify app about token refresh
            window.dispatchEvent(new CustomEvent("tokenRefreshed", { detail: { token: newToken } }));

            // retry original request with new token
            const retryHeaders = new Headers(init.headers as HeadersInit || {});
            if (!retryHeaders.get("Content-Type")) retryHeaders.set("Content-Type", "application/json");
            retryHeaders.set("Authorization", `Bearer ${newToken}`);

            res = await fetch(url, { ...init, headers: retryHeaders });
            return res;
          }
        }
      }
    } catch (e) {
      // ignore and fall through to unauthorized
    }

    // no refresh possible or refresh failed -> notify listeners (unless suppressed)
    if (!options?.suppressUnauthorized) {
      window.dispatchEvent(new CustomEvent("unauthorized"));
    }
  }

  return res;
}

export async function parseApiError(res: Response) {
  const result: {
    status: number;
    title?: string;
    message?: string;
    errors?: Record<string, string[]>;
    traceId?: string;
  } = { status: res.status };

  try {
    const body = await res.clone().json();
    if (body) {
      result.title = body.title || body.error || undefined;
      result.message = body.message || body.detail || undefined;
      result.traceId = body.traceId || body.trace_id || undefined;

      if (body.errors && typeof body.errors === "object") {
        result.errors = body.errors as Record<string, string[]>;
      } else if (typeof body === "object" && body !== null) {
        const keys = Object.keys(body);
        const looksLikeErrorMap = keys.length > 0 && keys.every((k) => Array.isArray((body as any)[k]));
        if (looksLikeErrorMap) {
          result.errors = body as Record<string, string[]>;
        }
      }

      // Normalize errors that use an empty-string key (e.g. { "": ["..."] })
      // into a consistent `_global` key so UI components can read them reliably.
      if (result.errors) {
        const keys = Object.keys(result.errors);
        if (keys.includes("")) {
          // move empty-string key to _global
          (result.errors as any)._global = result.errors[""];
          delete (result.errors as any)[""];
        } else {
          // also handle keys that are only whitespace
          for (const k of keys) {
            if (k.trim() === "") {
              (result.errors as any)._global = result.errors[k];
              delete (result.errors as any)[k];
              break;
            }
          }
        }
      }

      if (!result.errors && Array.isArray(body.errors)) {
        result.errors = { _global: body.errors };
      }
    }
  } catch (err) {
    try {
      const text = await res.text();
      if (text) result.message = text;
    } catch {}
  }

  if (!result.message) result.message = res.statusText || "Request failed";

  return result;
}

export function formatApiErrors(errObj: { errors?: Record<string, string[]>; message?: string }) {
  if (!errObj) return "An error occurred";
  if (errObj.errors) {
    const parts: string[] = [];
    for (const key of Object.keys(errObj.errors)) {
      const vals = errObj.errors[key];
      if (Array.isArray(vals)) parts.push(...vals);
    }
    if (parts.length) return parts.join(" ");
  }
  return errObj.message || "An error occurred";
}
