import type { TradingTimeframe } from "@/lib/trading-types";

type CandleRange = {
  startTime: number;
  endTime: number;
};

const TIMEFRAME_WINDOWS_SEC: Record<TradingTimeframe, number> = {
  "1m": 60 * 60 * 24,
  "1d": 60 * 60 * 24 * 365,
  "1w": 60 * 60 * 24 * 7 * 3 * 52,
};

const TIMEFRAME_REFRESH_MS: Record<TradingTimeframe, number> = {
  "1m": 15_000,
  "1d": 60_000,
  "1w": 5 * 60_000,
};

export const TIMEFRAME_LABELS: Record<TradingTimeframe, string> = {
  "1m": "1M",
  "1d": "1D",
  "1w": "1W",
};

export function getCandleRange(
  timeframe: TradingTimeframe,
  nowMs = Date.now(),
): CandleRange {
  const endTime = Math.floor(nowMs / 1000);
  const startTime = endTime - TIMEFRAME_WINDOWS_SEC[timeframe];

  return {
    startTime,
    endTime,
  };
}

export function getCandleRefreshIntervalMs(
  timeframe: TradingTimeframe,
): number {
  return TIMEFRAME_REFRESH_MS[timeframe];
}
