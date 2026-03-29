"use client";

import {
  formatLeverage,
  formatOrderId,
  formatPrice,
  formatSignedPnl,
  formatUsd,
  getPnlTone,
} from "@/lib/trading-format";
import type { ClosedPosition } from "@/lib/trading-types";

type TradeHistoryTableProps = {
  history: ClosedPosition[];
  isLoading: boolean;
  isRefreshing: boolean;
  errorMessage: string | null;
};

function getPnlClassName(pnl: number): string {
  const tone = getPnlTone(pnl);

  if (tone === "positive") {
    return "cfd-positive-text";
  }

  if (tone === "negative") {
    return "cfd-negative-text";
  }

  return "cfd-muted";
}

export function TradeHistoryTable({
  history,
  isLoading,
  isRefreshing,
  errorMessage,
}: TradeHistoryTableProps) {
  return (
    <section className="cfd-surface rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="cfd-muted text-sm font-semibold tracking-wide uppercase">
          Closed Positions
        </h2>
        <span className="cfd-muted text-xs">
          {isLoading
            ? "Loading..."
            : isRefreshing
              ? "Refreshing..."
              : `${history.length} closed`}
        </span>
      </div>

      {errorMessage ? (
        <p className="cfd-negative-text mb-3 text-sm">{errorMessage}</p>
      ) : null}

      {isLoading && history.length === 0 ? (
        <p className="cfd-muted text-sm">Loading position history...</p>
      ) : null}

      {!isLoading && history.length === 0 ? (
        <p className="cfd-muted text-sm">
          No closed positions yet. Closed trades will appear here.
        </p>
      ) : null}

      {history.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="cfd-border border-b">
                <th className="cfd-muted px-2 py-2 text-left font-medium">
                  Order
                </th>
                <th className="cfd-muted px-2 py-2 text-left font-medium">
                  Side
                </th>
                <th className="cfd-muted px-2 py-2 text-left font-medium">
                  Margin
                </th>
                <th className="cfd-muted px-2 py-2 text-left font-medium">
                  Leverage
                </th>
                <th className="cfd-muted px-2 py-2 text-left font-medium">
                  Open
                </th>
                <th className="cfd-muted px-2 py-2 text-left font-medium">
                  Close
                </th>
                <th className="cfd-muted px-2 py-2 text-right font-medium">
                  PnL
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((position) => {
                const sideClass =
                  position.type === "buy"
                    ? "cfd-buy-text"
                    : "cfd-negative-text";

                return (
                  <tr
                    key={position.orderId}
                    className="cfd-border border-b last:border-b-0"
                  >
                    <td className="px-2 py-2 font-medium">
                      {formatOrderId(position.orderId)}
                    </td>
                    <td className={`px-2 py-2 uppercase ${sideClass}`}>
                      {position.type}
                    </td>
                    <td className="px-2 py-2">{formatUsd(position.margin)}</td>
                    <td className="px-2 py-2">
                      {formatLeverage(position.leverage)}
                    </td>
                    <td className="px-2 py-2">
                      {formatPrice(position.openPrice)}
                    </td>
                    <td className="px-2 py-2">
                      {formatPrice(position.closePrice)}
                    </td>
                    <td
                      className={`px-2 py-2 text-right font-semibold ${getPnlClassName(position.pnl)}`}
                    >
                      {formatSignedPnl(position.pnl)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
