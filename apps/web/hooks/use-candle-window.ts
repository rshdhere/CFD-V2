"use client";

import { useEffect, useState } from "react";
import { getCandleRange, getCandleRefreshIntervalMs } from "@/lib/trading-time";
import type { TradingTimeframe } from "@/lib/trading-types";

type CandleWindow = {
  startTime: number;
  endTime: number;
};

export function useCandleWindow(timeframe: TradingTimeframe): CandleWindow {
  const [candleWindow, setCandleWindow] = useState<CandleWindow>(() =>
    getCandleRange(timeframe),
  );

  useEffect(() => {
    setCandleWindow(getCandleRange(timeframe));

    const intervalId = window.setInterval(() => {
      setCandleWindow(getCandleRange(timeframe));
    }, getCandleRefreshIntervalMs(timeframe));

    return () => {
      window.clearInterval(intervalId);
    };
  }, [timeframe]);

  return candleWindow;
}
