"use client";

import { useEffect, useMemo, useState } from "react";
import type { SpotQuoteMessage } from "@CFD-V2/validators/redis/types";

const WS_URL_OVERRIDE = process.env.NEXT_PUBLIC_TRADING_WS_URL?.trim();
const WS_PORT_OVERRIDE = process.env.NEXT_PUBLIC_TRADING_WS_PORT?.trim();
const DEFAULT_TRADING_WS_PORT = "5345";
const WS_RECONNECT_MAX_DELAY_MS = 10_000;
const WS_KEEP_ALIVE_MS = 25_000;

type LiveAssetQuote = {
  buyPrice: number;
  sellPrice: number;
  timestamp: number;
};

type UseLiveAssetQuotesOptions = {
  enabled?: boolean;
  symbols: string[];
};

type UseLiveAssetQuotesReturn = {
  quotesBySymbol: Record<string, LiveAssetQuote>;
  isConnected: boolean;
  errorMessage: string | null;
};

function resolveTradingWsUrl() {
  if (WS_URL_OVERRIDE && WS_URL_OVERRIDE.length > 0) {
    return WS_URL_OVERRIDE;
  }

  if (typeof window === "undefined") {
    return null;
  }

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const hostname = window.location.hostname;
  const port =
    WS_PORT_OVERRIDE && WS_PORT_OVERRIDE.length > 0
      ? WS_PORT_OVERRIDE
      : DEFAULT_TRADING_WS_PORT;

  return `${protocol}://${hostname}:${port}`;
}

function isSpotQuoteMessage(value: unknown): value is SpotQuoteMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const data = value as Partial<SpotQuoteMessage>;

  return (
    typeof data.symbol === "string" &&
    typeof data.pair === "string" &&
    typeof data.bid === "string" &&
    typeof data.ask === "string" &&
    typeof data.decimals === "number" &&
    typeof data.ts === "number"
  );
}

function parseQuoteUpdate(
  rawData: string,
  subscribedSymbols: Set<string>,
): {
  symbol: string;
  buyPrice: number;
  sellPrice: number;
  timestamp: number;
} | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawData);
  } catch {
    return null;
  }

  if (!isSpotQuoteMessage(parsed)) {
    return null;
  }

  const symbol = parsed.symbol.trim().toUpperCase();
  if (!subscribedSymbols.has(symbol)) {
    return null;
  }

  const buyPrice = Number(parsed.ask);
  const sellPrice = Number(parsed.bid);
  if (
    !Number.isFinite(buyPrice) ||
    !Number.isFinite(sellPrice) ||
    buyPrice <= 0 ||
    sellPrice <= 0
  ) {
    return null;
  }

  return {
    symbol,
    buyPrice,
    sellPrice,
    timestamp: parsed.ts,
  };
}

export function useLiveAssetQuotes({
  enabled = true,
  symbols,
}: UseLiveAssetQuotesOptions): UseLiveAssetQuotesReturn {
  const [quotesBySymbol, setQuotesBySymbol] = useState<
    Record<string, LiveAssetQuote>
  >({});
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subscriptionKey = useMemo(() => {
    return [...new Set(symbols.map((symbol) => symbol.trim().toUpperCase()))]
      .filter((symbol) => symbol.length > 0)
      .sort()
      .join(",");
  }, [symbols]);

  useEffect(() => {
    if (!enabled || subscriptionKey.length === 0) {
      setIsConnected(false);
      setErrorMessage(null);
      return;
    }

    const wsUrl = resolveTradingWsUrl();
    if (!wsUrl) {
      setIsConnected(false);
      setErrorMessage("Live quote stream is unavailable in this environment.");
      return;
    }
    const resolvedWsUrl = wsUrl;
    const activeSymbols = subscriptionKey.split(",");

    const subscribedSymbols = new Set(activeSymbols);
    let socket: WebSocket | null = null;
    let reconnectTimeoutId: number | null = null;
    let keepAliveIntervalId: number | null = null;
    let reconnectAttempt = 0;
    let shouldReconnect = true;

    function subscribe(type: "SUBSCRIBE" | "UNSUBSCRIBE") {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return;
      }

      for (const symbol of activeSymbols) {
        socket.send(
          JSON.stringify({
            type,
            symbol,
          }),
        );
      }
    }

    function startKeepAlive() {
      if (keepAliveIntervalId != null) {
        window.clearInterval(keepAliveIntervalId);
      }

      keepAliveIntervalId = window.setInterval(() => {
        // Re-sending subscriptions keeps the stream active on long-lived tabs.
        subscribe("SUBSCRIBE");
      }, WS_KEEP_ALIVE_MS);
    }

    function clearKeepAlive() {
      if (keepAliveIntervalId != null) {
        window.clearInterval(keepAliveIntervalId);
        keepAliveIntervalId = null;
      }
    }

    function scheduleReconnect() {
      if (!shouldReconnect) {
        return;
      }

      reconnectAttempt += 1;
      const delay = Math.min(
        1000 * 2 ** reconnectAttempt,
        WS_RECONNECT_MAX_DELAY_MS,
      );
      reconnectTimeoutId = window.setTimeout(connect, delay);
    }

    function connect() {
      if (
        socket &&
        (socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      socket = new WebSocket(resolvedWsUrl);

      socket.addEventListener("open", () => {
        reconnectAttempt = 0;
        setIsConnected(true);
        setErrorMessage(null);
        subscribe("SUBSCRIBE");
        startKeepAlive();
      });

      socket.addEventListener("message", (event) => {
        if (typeof event.data !== "string") {
          return;
        }

        const update = parseQuoteUpdate(event.data, subscribedSymbols);
        if (!update) {
          return;
        }

        setQuotesBySymbol((current) => {
          const previousQuote = current[update.symbol];
          if (
            previousQuote &&
            previousQuote.buyPrice === update.buyPrice &&
            previousQuote.sellPrice === update.sellPrice &&
            previousQuote.timestamp === update.timestamp
          ) {
            return current;
          }

          return {
            ...current,
            [update.symbol]: {
              buyPrice: update.buyPrice,
              sellPrice: update.sellPrice,
              timestamp: update.timestamp,
            },
          };
        });
      });

      socket.addEventListener("error", () => {
        setErrorMessage("Live quote stream connection failed. Retrying...");
      });

      socket.addEventListener("close", () => {
        setIsConnected(false);
        clearKeepAlive();
        setErrorMessage("Live quote stream disconnected. Reconnecting...");
        scheduleReconnect();
      });
    }

    connect();

    return () => {
      shouldReconnect = false;

      if (reconnectTimeoutId != null) {
        window.clearTimeout(reconnectTimeoutId);
      }
      clearKeepAlive();

      subscribe("UNSUBSCRIBE");
      socket?.close();
      setIsConnected(false);
    };
  }, [enabled, subscriptionKey]);

  return {
    quotesBySymbol,
    isConnected,
    errorMessage,
  };
}
