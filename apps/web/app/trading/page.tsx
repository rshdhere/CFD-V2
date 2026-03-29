"use client";

import { FastLoader } from "@/components/loader";
import { TradingShell } from "@/components/trading/trading-shell";
import { useRequireAuth } from "@/utils/auth/guards";

export default function TradingPage() {
  const { isAuthReady, isAuthenticated } = useRequireAuth({
    redirectTo: "/login",
  });

  if (!isAuthReady || !isAuthenticated) {
    return (
      <div className="cfd-page flex min-h-screen items-center justify-center">
        <FastLoader content="Loading trading terminal..." />
      </div>
    );
  }

  return <TradingShell />;
}
