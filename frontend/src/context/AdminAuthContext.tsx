import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { adminApi } from "../lib/adminApi";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("admin_token"));
  const [isLoading, setIsLoading] = useState(true);

  // Verify token on mount — jika gagal, coba refresh token sebelum redirect
  useEffect(() => {
    const stored = localStorage.getItem("admin_token");
    const storedRefresh = localStorage.getItem("admin_refresh_token");
    if (!stored) {
      setIsLoading(false);
      return;
    }
    adminApi
      .get<{ success: boolean; data: AdminUser }>("/api/auth/me")
      .then((res) => setUser(res.data))
      .catch(async (err: any) => {
        // Coba refresh token jika access token expired (401)
        if ((err?.message === "Unauthorized" || err?.status === 401) && storedRefresh) {
          try {
            const refreshRes = await fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken: storedRefresh }),
            });
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              const newToken = refreshData.data?.accessToken;
              const newRefresh = refreshData.data?.refreshToken;
              if (newToken) {
                localStorage.setItem("admin_token", newToken);
                if (newRefresh) localStorage.setItem("admin_refresh_token", newRefresh);
                setToken(newToken);
                // Retry getMe with new token
                const meRes = await adminApi.get<{ success: boolean; data: AdminUser }>("/api/auth/me");
                setUser(meRes.data);
                return;
              }
            }
          } catch {
            // Refresh gagal, lanjut ke clear
          }
          // Clear semua jika refresh pun gagal
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_refresh_token");
          setToken(null);
        }
        // Jika error bukan 401 (misal: network error saat backend restart), JANGAN logout!
        // user tetap null, tapi token tidak dihapus — akan dicoba lagi saat reload berikutnya
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await adminApi.post<{
      success: boolean;
      data: { accessToken: string; refreshToken: string; user: AdminUser };
    }>("/api/auth/login", { email, password });
    
    localStorage.setItem("admin_token", res.data.accessToken);
    // Simpan refresh token untuk auto-renew saat access token expired
    if (res.data.refreshToken) {
      localStorage.setItem("admin_refresh_token", res.data.refreshToken);
    }
    setToken(res.data.accessToken);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
