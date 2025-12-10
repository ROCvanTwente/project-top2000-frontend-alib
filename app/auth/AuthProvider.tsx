"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, parseApiError } from "../../lib/api";
import { useRef } from "react";

type ApiError = {
  status?: number;
  message?: string;
  errors?: Record<string, string[]>;
  title?: string;
  traceId?: string;
};

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  initialized: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const refreshTimer = useRef<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("jwtToken");
    if (token) setToken(token);
    const expiresAt = localStorage.getItem("expiresAt");
    if (expiresAt) scheduleRefresh(expiresAt);
    setInitialized(true);
  }, []);

  // schedule a token refresh based on expiresAt value
  const scheduleRefresh = (expiresAtValue?: string | number | null) => {
    // clear existing timer
    if (refreshTimer.current) {
      window.clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }

    if (!expiresAtValue) return;

    const refreshBeforeMs = 60 * 1000; // refresh 60s before expiry
    let expiryMs = typeof expiresAtValue === "string" ? Date.parse(expiresAtValue) : Number(expiresAtValue);
    if (Number.isNaN(expiryMs) || expiryMs <= 0) {
      // fallback: if value is not parseable, don't schedule
      return;
    }

    const msUntilRefresh = expiryMs - Date.now() - refreshBeforeMs;

    const schedule = () => {
      // call refreshToken when timer fires
      refreshTimer.current = window.setTimeout(async () => {
        const ok = await refreshToken();
        if (!ok) {
          logout();
        }
      }, Math.max(0, msUntilRefresh));
    };

    if (msUntilRefresh <= 0) {
      // already near/expired, refresh immediately
      (async () => {
        const ok = await refreshToken();
        if (!ok) logout();
      })();
    } else {
      schedule();
    }
  };

  // perform refresh using the refresh token directly (avoid apiFetch recursion)
  const refreshToken = async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) return false;

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "";
      const url = API ? `${API}/auth/refresh-token` : `/auth/refresh-token`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });

      if (!res.ok) return false;

      const data = await res.json().catch(() => ({}));
      const newToken = data.token || data.accessToken || data.access_token;
      const newRefresh = data.refreshToken || data.refresh_token || data.refresh;
      const expiresAt = data.expiresAt || data.expires_at || data.expires;

      if (!newToken) return false;

      localStorage.setItem("jwtToken", newToken);
      if (newRefresh) localStorage.setItem("refreshToken", newRefresh);
      if (expiresAt) localStorage.setItem("expiresAt", String(expiresAt));
      setToken(newToken);

      // schedule next refresh
      scheduleRefresh(expiresAt ?? null);

      // notify other parts of app
      window.dispatchEvent(new CustomEvent("tokenRefreshed", { detail: { token: newToken } }));

      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onTokenRefreshed = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as { token?: string } | undefined;
        if (detail && detail.token) setToken(detail.token);
      } catch {
        // ignore
      }
    };

    const onUnauthorized = () => {
      logout();
    };

    window.addEventListener("tokenRefreshed", onTokenRefreshed as EventListener);
    window.addEventListener("unauthorized", onUnauthorized as EventListener);

    return () => {
      window.removeEventListener("tokenRefreshed", onTokenRefreshed as EventListener);
      window.removeEventListener("unauthorized", onUnauthorized as EventListener);
      // clear any pending refresh timer
      if (refreshTimer.current) {
        window.clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const parsed = await parseApiError(res);
      throw parsed as ApiError;
    }

    const data = await res.json();
    const token = data.token || data.accessToken || data.access_token;
    const refresh = data.refreshToken || data.refresh_token || data.refresh;
    const expiresAt = data.expiresAt || data.expires_at || data.expires;

    if (!token) throw { message: "No token returned from API" } as ApiError;

    localStorage.setItem("jwtToken", token);
    if (refresh) localStorage.setItem("refreshToken", refresh);
    if (expiresAt) localStorage.setItem("expiresAt", String(expiresAt));
    setToken(token);

    // schedule proactive refresh
    scheduleRefresh(expiresAt ?? null);

    router.push("/");
  };

  const register = async (email: string, password: string, confirmPassword?: string) => {
    const res = await apiFetch(`/auth/register`, {
      method: "POST",
      body: JSON.stringify({ email, password, confirmPassword }),
    });

    if (!res.ok) {
      const parsed = await parseApiError(res);
      throw parsed as ApiError;
    }

    const data = await res.json().catch(() => ({}));
    const token = data.token || data.accessToken || data.access_token;
    const refresh = data.refreshToken || data.refresh_token || data.refresh;
    const expiresAt = data.expiresAt || data.expires_at || data.expires;

    if (token) {
      localStorage.setItem("jwtToken", token);
      if (refresh) localStorage.setItem("refreshToken", refresh);
      if (expiresAt) localStorage.setItem("expiresAt", String(expiresAt));
      setToken(token);
      // schedule proactive refresh
      scheduleRefresh(expiresAt ?? null);

      router.push("/");
      return;
    }

    router.push("/login");
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expiresAt");
    setToken(null);
    // clear any pending refresh timer
    if (refreshTimer.current) {
      window.clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated: !!token, initialized, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  
  return ctx;
};

export default AuthProvider;
