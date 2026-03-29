"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearAccessToken as clearStoredAccessToken,
  getAccessToken,
  setAccessToken as setStoredAccessToken,
} from "@/utils/auth/access-token";
import { initAuth, logout as logoutRequest } from "@/utils/auth/auth-fetch";

type AuthContextValue = {
  isAuthReady: boolean;
  isAuthenticated: boolean;
  setAuthToken: (accessToken: string) => void;
  clearAuthToken: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  trpcUrl,
}: {
  children: React.ReactNode;
  trpcUrl: string;
}) {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(getAccessToken()),
  );

  useEffect(() => {
    let isMounted = true;

    initAuth(trpcUrl)
      .then((authenticated) => {
        if (!isMounted) {
          return;
        }

        setIsAuthenticated(authenticated);
      })
      .finally(() => {
        if (isMounted) {
          setIsAuthReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [trpcUrl]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthReady,
      isAuthenticated,
      setAuthToken(accessToken: string) {
        setStoredAccessToken(accessToken);
        setIsAuthenticated(true);
      },
      clearAuthToken() {
        clearStoredAccessToken();
        setIsAuthenticated(false);
      },
      async logout() {
        await logoutRequest(trpcUrl);
        clearStoredAccessToken();
        setIsAuthenticated(false);
      },
    }),
    [isAuthReady, isAuthenticated, trpcUrl],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return authContext;
}
