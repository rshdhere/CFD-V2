"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/trading-format";
import type { OpenPosition } from "@/lib/trading-types";
import { useTRPC } from "@/utils/trpc";

type UseOpenPositionsPollingOptions = {
  enabled: boolean;
  pollIntervalMs?: number;
};

type UseOpenPositionsPollingReturn = {
  positions: OpenPosition[];
  isLoading: boolean;
  isRefreshing: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
};

export function useOpenPositionsPolling({
  enabled,
  pollIntervalMs = 5_000,
}: UseOpenPositionsPollingOptions): UseOpenPositionsPollingReturn {
  const trpc = useTRPC();
  const [positions, setPositions] = useState<OpenPosition[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const inFlightRef = useRef(false);

  const openPositionsMutation = useMutation(
    trpc.v1.trades.open.mutationOptions(),
  );

  const refresh = useCallback(async () => {
    if (!enabled || inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    try {
      const response = await openPositionsMutation.mutateAsync(undefined);
      setPositions(response.trades);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to fetch open positions"));
    } finally {
      setHasFetchedOnce(true);
      inFlightRef.current = false;
    }
  }, [enabled, openPositionsMutation]);

  useEffect(() => {
    if (!enabled) {
      setPositions([]);
      setErrorMessage(null);
      setHasFetchedOnce(false);
      return;
    }

    void refresh();
    const intervalId = window.setInterval(() => {
      void refresh();
    }, pollIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, pollIntervalMs, refresh]);

  return {
    positions,
    isLoading: enabled && !hasFetchedOnce && openPositionsMutation.isPending,
    isRefreshing: openPositionsMutation.isPending,
    errorMessage,
    refresh,
  };
}
