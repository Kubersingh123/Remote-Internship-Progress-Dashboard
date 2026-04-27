import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authService, clearTokens, getStoredAccessToken, setSessionExpiredHandler, setTokens } from "../services/api";
import type { User } from "../app/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getTokenExpiryMs(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
    if (!payload.exp) return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    clearTokens();
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(logout);
  }, [logout]);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    authService
      .me()
      .then((profile) => setUser(profile))
      .catch(() => logout())
      .finally(() => setIsLoading(false));
  }, [logout]);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) return;
    const expiryMs = getTokenExpiryMs(token);
    if (!expiryMs) return;
    const timeout = expiryMs - Date.now();
    if (timeout <= 0) {
      logout();
      return;
    }
    const timer = window.setTimeout(() => logout(), timeout);
    return () => window.clearTimeout(timer);
  }, [user, logout]);

  const login = useCallback(async (email: string, password: string) => {
    const payload = await authService.login(email, password);
    setTokens(payload.access_token, payload.refresh_token ?? null);
    setUser(payload.user);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
}
