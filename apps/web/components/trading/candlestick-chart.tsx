"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type {
  Candle,
  TradingAsset,
  TradingTimeframe,
} from "@/lib/trading-types";

type CandlestickChartProps = {
  asset: TradingAsset;
  timeframe: TradingTimeframe;
  candles: Candle[];
  isLoading: boolean;
  errorMessage: string | null;
};

function readPalette() {
  const styles = getComputedStyle(document.documentElement);

  return {
    surface: styles.getPropertyValue("--cfd-surface").trim(),
    text: styles.getPropertyValue("--cfd-text").trim(),
    border: styles.getPropertyValue("--cfd-border").trim(),
    buy: styles.getPropertyValue("--cfd-buy").trim(),
    sell: styles.getPropertyValue("--cfd-sell").trim(),
    muted: styles.getPropertyValue("--cfd-text-muted").trim(),
  };
}

function applyPalette(
  chart: IChartApi,
  series: ReturnType<IChartApi["addSeries"]>,
) {
  const palette = readPalette();

  chart.applyOptions({
    layout: {
      background: {
        type: ColorType.Solid,
        color: palette.surface,
      },
      textColor: palette.text,
      attributionLogo: false,
    },
    grid: {
      vertLines: {
        color: palette.border,
      },
      horzLines: {
        color: palette.border,
      },
    },
    rightPriceScale: {
      borderColor: palette.border,
    },
    timeScale: {
      borderColor: palette.border,
    },
    crosshair: {
      vertLine: {
        color: palette.muted,
      },
      horzLine: {
        color: palette.muted,
      },
    },
  });

  series.applyOptions({
    upColor: palette.buy,
    downColor: palette.sell,
    borderVisible: false,
    wickUpColor: palette.buy,
    wickDownColor: palette.sell,
  });
}

export function CandlestickChart({
  asset,
  timeframe,
  candles,
  isLoading,
  errorMessage,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ReturnType<IChartApi["addSeries"]> | null>(null);

  const chartData = useMemo<CandlestickData<UTCTimestamp>[]>(
    () =>
      [...candles]
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((candle) => ({
          time: candle.timestamp as UTCTimestamp,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        })),
    [candles],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
    });

    const series = chart.addSeries(CandlestickSeries, {
      borderVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;
    applyPalette(chart, series);

    const resizeObserver = new ResizeObserver((entries) => {
      const [entry] = entries;
      if (!entry) {
        return;
      }

      const { width, height } = entry.contentRect;
      chart.applyOptions({
        width,
        height: Math.max(320, height),
      });
    });
    resizeObserver.observe(container);

    const themeObserver = new MutationObserver(() => {
      applyPalette(chart, series);
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      themeObserver.disconnect();
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) {
      return;
    }

    seriesRef.current.setData(chartData);
    if (chartData.length > 0) {
      chartRef.current.timeScale().fitContent();
    }
  }, [chartData]);

  return (
    <section className="cfd-surface rounded-xl border">
      <div className="cfd-border flex items-center justify-between border-b p-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase">
          {asset}/USDT Candles
        </h2>
        <span className="cfd-muted text-sm">Interval: {timeframe}</span>
      </div>

      {errorMessage ? (
        <p className="cfd-negative-text px-4 pt-3 text-sm">{errorMessage}</p>
      ) : null}

      <div className="relative h-[420px] p-2">
        <div ref={containerRef} className="size-full rounded-lg" />
        {isLoading ? (
          <div className="cfd-muted absolute inset-0 flex items-center justify-center text-sm">
            Loading candles...
          </div>
        ) : null}
        {!isLoading && !errorMessage && chartData.length === 0 ? (
          <div className="cfd-muted absolute inset-0 flex items-center justify-center text-sm">
            No candles available for the selected window
          </div>
        ) : null}
      </div>
    </section>
  );
}
