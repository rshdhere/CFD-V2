"use client";

import { useState } from "react";
import { TRPCProvider } from "@/utils/trpc";
import { AuthProvider } from "@/providers/auth-provider";
import { createAuthFetch } from "@/utils/auth/auth-fetch";
import type { AppRouter } from "@CFD-V2/api/trpc";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

export default function TRPCReactProvider({
  children,
  trpcUrl,
}: {
  children: React.ReactNode;
  trpcUrl: string;
}) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: trpcUrl,
          fetch: createAuthFetch(trpcUrl),
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <AuthProvider trpcUrl={trpcUrl}>{children}</AuthProvider>
      </TRPCProvider>
    </QueryClientProvider>
  );
}
