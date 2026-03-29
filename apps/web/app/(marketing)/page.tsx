"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FastLoader } from "@/components/loader";
import { useAuth } from "@/providers/auth-provider";
import { ModelTheme } from "@/components/mode-toggle";

export default function Home() {
  const router = useRouter();
  const { isAuthReady, isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    await logout();
    router.replace("/login");
  };

  if (!isAuthReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-neutral-900 dark:text-neutral-300">
        <FastLoader content="Loading" />
      </div>
    );
  }

  if (isLoggingOut) {
    return (
      <div className="flex min-h-screen items-center justify-center text-neutral-900 dark:text-neutral-300">
        <FastLoader content="Logging out..." />
      </div>
    );
  }

  return (
    <div className="text-neutral-900 dark:text-neutral-300">
      <ModelTheme />
      <div className="flex gap-4">
        {isAuthenticated ? (
          <>
            <Link href="/trading">Trading</Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex cursor-pointer items-center underline disabled:cursor-not-allowed"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/signup">Get Started</Link>
            <Link href="/login">Login</Link>
            <Link href="/trading">Trading</Link>
          </>
        )}
      </div>
    </div>
  );
}
