"use client";

import {
  formatLeverage,
  formatNumber,
  formatPrice,
  formatUsd,
} from "@/lib/trading-format";
import type { OpenPosition } from "@/lib/trading-types";

type OpenPositionsTableProps = {
  positions: OpenPosition[];
  isLoading: boolean;
  isRefreshing: boolean;
  errorMessage: string | null;
  closingOrderId: string | null;
  onClosePosition: (orderId: string) => Promise<void>;
};

export function OpenPositionsTable({
  positions,
  isLoading,
  isRefreshing,
  errorMessage,
  closingOrderId,
  onClosePosition,
}: OpenPositionsTableProps) {
  return (
    <section className="cfd-surface rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="cfd-muted text-sm font-semibold tracking-wide uppercase">
          Open Positions
        </h2>
        <span className="cfd-muted text-xs">
          {isLoading
            ? "Loading..."
            : isRefreshing
              ? "Refreshing..."
              : `${positions.length} active`}
        </span>
      </div>

      {errorMessage ? (
        <p className="cfd-negative-text mb-3 text-sm">{errorMessage}</p>
      ) : null}

      {isLoading && positions.length === 0 ? (
        <p className="cfd-muted text-sm">Fetching active positions...</p>
      ) : null}

      {!isLoading && positions.length === 0 ? (
        <p className="cfd-muted text-sm">
          No open positions yet. Place a trade from the ticket.
        </p>
      ) : null}

      {positions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="cfd-border border-b">
                <th className="cfd-muted px-2 py-2 text-left font-medium">
                  Side
                </th>
                <th className="cfd-muted px-2 py-2 text-left font-medium">
                  Asset
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
                  TP
                </th>
                <th className="cfd-muted px-2 py-2 text-left font-medium">
                  SL
                </th>
                <th className="cfd-muted px-2 py-2 text-left font-medium">
                  Liq.
                </th>
                <th className="cfd-muted px-2 py-2 text-right font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => {
                const isClosing = closingOrderId === position.orderId;
                const sideClass =
                  position.type === "buy"
                    ? "cfd-buy-text"
                    : "cfd-negative-text";

                return (
                  <tr
                    key={position.orderId}
                    className="cfd-border border-b last:border-b-0"
                  >
                    <td
                      className={`px-2 py-2 font-medium uppercase ${sideClass}`}
                    >
                      {position.type}
                    </td>
                    <td className="px-2 py-2">{position.asset}/USDT</td>
                    <td className="px-2 py-2">{formatUsd(position.margin)}</td>
                    <td className="px-2 py-2">
                      {formatLeverage(position.leverage)}
                    </td>
                    <td className="px-2 py-2">
                      {formatPrice(position.openPrice)}
                    </td>
                    <td className="px-2 py-2">
                      {formatNumber(position.takeProfit)}
                    </td>
                    <td className="px-2 py-2">
                      {formatNumber(position.stopLoss)}
                    </td>
                    <td className="px-2 py-2">
                      {formatNumber(position.liquidationPrice)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <button
                        type="button"
                        disabled={isClosing}
                        className="cfd-secondary-button cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-70"
                        onClick={() => {
                          void onClosePosition(position.orderId);
                        }}
                      >
                        {isClosing ? "Closing..." : "Close"}
                      </button>
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
