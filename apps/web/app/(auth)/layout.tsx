"use client";

import React from "react";
import { useRequireGuest } from "@/utils/auth/guards";
import { FastLoader } from "@/components/loader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthReady, isAuthenticated } = useRequireGuest();

  if (!isAuthReady || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <FastLoader content="Loading" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      {children}
    </div>
  );
}
