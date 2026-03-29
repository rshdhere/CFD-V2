"use client";

import { formatPrice } from "@/lib/trading-format";
import { TIMEFRAME_LABELS } from "@/lib/trading-time";
import {
  TRADING_TIMEFRAMES,
  type AssetQuote,
  type TradingAsset,
  type TradingTimeframe,
} from "@/lib/trading-types";
import { cn } from "@/lib/utils";

type AssetSelectorProps = {
  assets: AssetQuote[];
  selectedAsset: TradingAsset;
  timeframe: TradingTimeframe;
  isLoading: boolean;
  isRefreshing: boolean;
  errorMessage: string | null;
  onAssetChange: (asset: TradingAsset) => void;
  onTimeframeChange: (timeframe: TradingTimeframe) => void;
};

function quoteOrPlaceholder(value: number): string {
  if (value <= 0) {
    return "--";
  }

  return formatPrice(value);
}

export function AssetSelector({
  assets,
  selectedAsset,
  timeframe,
  isLoading,
  isRefreshing,
  errorMessage,
  onAssetChange,
  onTimeframeChange,
}: AssetSelectorProps) {
  return (
    <section className="cfd-surface rounded-xl border p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="cfd-muted text-sm font-semibold tracking-wide uppercase">
            Market
          </h2>
          <p className="cfd-muted text-sm">
            {isLoading
              ? "Loading prices..."
              : isRefreshing
                ? "Refreshing quotes..."
                : "Live quotes for supported assets"}
          </p>
        </div>
        <div className="cfd-surface-subtle flex items-center gap-2 rounded-md border p-1">
          {TRADING_TIMEFRAMES.map((option) => (
            <button
              key={option}
              type="button"
              className="cfd-control rounded-md px-2.5 py-1.5 text-xs font-medium transition"
              data-active={timeframe === option}
              onClick={() => onTimeframeChange(option)}
            >
              {TIMEFRAME_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      {errorMessage ? (
        <p className="cfd-negative-text mb-3 text-sm">{errorMessage}</p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-3">
        {assets.map((asset) => {
          const isActive = asset.symbol === selectedAsset;

          return (
            <button
              key={asset.symbol}
              type="button"
              className={cn(
                "cfd-control rounded-lg border p-3 text-left transition",
                "cfd-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              )}
              data-active={isActive}
              onClick={() => onAssetChange(asset.symbol as TradingAsset)}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">{asset.name}</span>
                <span className="cfd-muted text-xs">{asset.symbol}/USDT</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="flex items-center justify-between">
                  <span className="cfd-muted">Buy</span>
                  <span className="cfd-buy-text font-medium">
                    {quoteOrPlaceholder(asset.buyPrice)}
                  </span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="cfd-muted">Sell</span>
                  <span className="cfd-negative-text font-medium">
                    {quoteOrPlaceholder(asset.sellPrice)}
                  </span>
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
