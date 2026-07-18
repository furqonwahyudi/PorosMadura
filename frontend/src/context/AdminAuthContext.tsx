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
      .get<{ user: AdminUser }>("/api/auth/me")
      .then(({ user }) => setUser(user))
      .catch(() => {
        localStorage.removeItem("admin_token");
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await adminApi.post<{ accessToken: string; user: AdminUser }>(
      "/api/auth/login",
      { email, password }
    );
    localStorage.setItem("admin_token", res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
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
