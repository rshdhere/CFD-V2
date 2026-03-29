"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

type RouteGuardOptions = {
  redirectTo?: string;
};

export function useRequireAuth(options?: RouteGuardOptions) {
  const router = useRouter();
  const { isAuthReady, isAuthenticated } = useAuth();
  const redirectTo = options?.redirectTo ?? "/signin";

  useEffect(() => {
    if (!isAuthReady || isAuthenticated) {
      return;
    }

    router.replace(redirectTo);
  }, [isAuthReady, isAuthenticated, redirectTo, router]);

  return {
    isAuthReady,
    isAuthenticated,
  };
}

export function useRequireGuest(options?: RouteGuardOptions) {
  const router = useRouter();
  const { isAuthReady, isAuthenticated } = useAuth();
  const redirectTo = options?.redirectTo ?? "/";

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated) {
      return;
    }

    router.replace(redirectTo);
  }, [isAuthReady, isAuthenticated, redirectTo, router]);

  return {
    isAuthReady,
    isAuthenticated,
  };
}
