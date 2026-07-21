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

  // Verify token on mount
  useEffect(() => {
    const stored = localStorage.getItem("admin_token");
    if (!stored) {
      setIsLoading(false);
      return;
    }
    adminApi
      .get<{ success: boolean; data: AdminUser }>("/api/auth/me")
      .then((res) => setUser(res.data))
      .catch((err: any) => {
        // Only clear token if explicitly Unauthorized (401). Don't log out on 429 rate limit or network glitches!
        if (err?.message === "Unauthorized" || err?.status === 401) {
          localStorage.removeItem("admin_token");
          setToken(null);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await adminApi.post<{
      success: boolean;
      data: { accessToken: string; user: AdminUser };
    }>("/api/auth/login", { email, password });
    
    localStorage.setItem("admin_token", res.data.accessToken);
    setToken(res.data.accessToken);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
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
