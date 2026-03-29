"use client";

import { useMemo, useState } from "react";
import {
  formatLeverage,
  formatPrice,
  formatUsd,
  getErrorMessage,
} from "@/lib/trading-format";
import {
  TRADING_LEVERAGES,
  type AssetQuote,
  type TradeDirection,
  type TradeLeverage,
  type TradeOpenInput,
  type TradingAsset,
} from "@/lib/trading-types";
import { cn } from "@/lib/utils";

type TradeTicketProps = {
  asset: TradingAsset;
  quote: AssetQuote | undefined;
  isSubmitting: boolean;
  successMessage: string | null;
  errorMessage: string | null;
  onSubmit: (input: TradeOpenInput) => Promise<void>;
};

export function TradeTicket({
  asset,
  quote,
  isSubmitting,
  successMessage,
  errorMessage,
  onSubmit,
}: TradeTicketProps) {
  const defaultLeverage: TradeLeverage = TRADING_LEVERAGES[0] ?? 1;
  const [direction, setDirection] = useState<TradeDirection>("buy");
  const [margin, setMargin] = useState("100");
  const [leverage, setLeverage] = useState<TradeLeverage>(defaultLeverage);
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const activePrice = useMemo(() => {
    if (!quote) {
      return null;
    }

    return direction === "buy" ? quote.buyPrice : quote.sellPrice;
  }, [direction, quote]);

  const estimatedLiquidation = useMemo(() => {
    if (!activePrice || activePrice <= 0) {
      return null;
    }

    if (direction === "buy") {
      return Math.floor(activePrice * (1 - 1 / leverage));
    }

    return Math.floor(activePrice * (1 + 1 / leverage));
  }, [activePrice, direction, leverage]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const marginValue = Number(margin);
    const takeProfitValue =
      takeProfit.trim().length > 0 ? Number(takeProfit) : 0;
    const stopLossValue = stopLoss.trim().length > 0 ? Number(stopLoss) : 0;

    if (!Number.isFinite(marginValue) || marginValue <= 0) {
      setLocalError("Margin must be a positive number");
      return;
    }

    if (
      takeProfit.trim().length > 0 &&
      (!Number.isFinite(takeProfitValue) || takeProfitValue <= 0)
    ) {
      setLocalError("Take profit must be a positive number");
      return;
    }

    if (
      stopLoss.trim().length > 0 &&
      (!Number.isFinite(stopLossValue) || stopLossValue <= 0)
    ) {
      setLocalError("Stop loss must be a positive number");
      return;
    }

    try {
      const payload: TradeOpenInput = {
        type: direction,
        margin: marginValue,
        leverage,
        asset,
        ...(takeProfit.trim().length > 0
          ? { takeProfit: takeProfitValue }
          : {}),
        ...(stopLoss.trim().length > 0 ? { stopLoss: stopLossValue } : {}),
      };

      await onSubmit(payload);
    } catch (error) {
      setLocalError(getErrorMessage(error, "Failed to place order"));
    }
  }

  return (
    <section className="cfd-surface rounded-xl border p-4">
      <h2 className="cfd-muted text-sm font-semibold tracking-wide uppercase">
        Trade Ticket
      </h2>
      <p className="cfd-muted mt-1 text-sm">
        Place a {asset}/USDT CFD order with leverage and optional TP/SL.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setDirection("buy")}
          className={cn("cfd-control rounded-md px-3 py-2 text-sm font-medium")}
          data-active={direction === "buy"}
          data-tone="buy"
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setDirection("sell")}
          className={cn("cfd-control rounded-md px-3 py-2 text-sm font-medium")}
          data-active={direction === "sell"}
          data-tone="sell"
        >
          Sell
        </button>
      </div>

      <div className="cfd-surface-subtle mt-3 rounded-md border p-3">
        <p className="cfd-muted text-xs">
          Entry price ({direction === "buy" ? "ask" : "bid"})
        </p>
        <p className="text-base font-semibold">
          {activePrice ? formatPrice(activePrice) : "--"}
        </p>
        <p className="cfd-muted mt-1 text-xs">
          Estimated liquidation:{" "}
          {estimatedLiquidation ? formatPrice(estimatedLiquidation) : "--"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="block">
          <span className="cfd-muted mb-1 block text-xs">Margin (USD)</span>
          <input
            value={margin}
            onChange={(event) => setMargin(event.target.value)}
            inputMode="decimal"
            className="cfd-input w-full rounded-md border px-3 py-2 text-sm"
            placeholder="100"
          />
        </label>

        <label className="block">
          <span className="cfd-muted mb-1 block text-xs">Leverage</span>
          <select
            value={leverage}
            onChange={(event) =>
              setLeverage(Number(event.target.value) as TradeLeverage)
            }
            className="cfd-input w-full rounded-md border px-3 py-2 text-sm"
          >
            {TRADING_LEVERAGES.map((option) => (
              <option key={option} value={option}>
                {formatLeverage(option)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="cfd-muted mb-1 block text-xs">
            Take Profit (optional)
          </span>
          <input
            value={takeProfit}
            onChange={(event) => setTakeProfit(event.target.value)}
            inputMode="decimal"
            className="cfd-input w-full rounded-md border px-3 py-2 text-sm"
            placeholder={activePrice ? formatPrice(activePrice * 1.02) : "Auto"}
          />
        </label>

        <label className="block">
          <span className="cfd-muted mb-1 block text-xs">
            Stop Loss (optional)
          </span>
          <input
            value={stopLoss}
            onChange={(event) => setStopLoss(event.target.value)}
            inputMode="decimal"
            className="cfd-input w-full rounded-md border px-3 py-2 text-sm"
            placeholder={activePrice ? formatPrice(activePrice * 0.98) : "Auto"}
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="cfd-primary-button w-full rounded-md px-3 py-2 text-sm font-semibold disabled:opacity-70"
          data-tone={direction}
        >
          {isSubmitting
            ? "Submitting..."
            : `Open ${direction === "buy" ? "Buy" : "Sell"} Position`}
        </button>
      </form>

      <div className="mt-3 space-y-1 text-sm">
        {successMessage ? (
          <p className="cfd-positive-text">{successMessage}</p>
        ) : null}
        {errorMessage ? (
          <p className="cfd-negative-text">{errorMessage}</p>
        ) : null}
        {localError ? <p className="cfd-negative-text">{localError}</p> : null}
      </div>

      <p className="cfd-muted mt-3 text-xs">
        Estimated notional:{" "}
        {formatUsd((Number(margin) || 0) * (Number(leverage) || 0))}
      </p>
    </section>
  );
}
