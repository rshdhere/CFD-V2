"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AssetSelector } from "@/components/trading/asset-selector";
import { CandlestickChart } from "@/components/trading/candlestick-chart";
import { OpenPositionsTable } from "@/components/trading/open-positions-table";
import { TradeHistoryTable } from "@/components/trading/trade-history-table";
import { TradeTicket } from "@/components/trading/trade-ticket";
import { useCandleWindow } from "@/hooks/use-candle-window";
import { useOpenPositionsPolling } from "@/hooks/use-open-positions";
import { getErrorMessage } from "@/lib/trading-format";
import { getCandleRefreshIntervalMs } from "@/lib/trading-time";
import type {
  TradeOpenInput,
  TradingAsset,
  TradingTimeframe,
} from "@/lib/trading-types";
import { ModelTheme } from "@/components/mode-toggle";
import { useTRPC } from "@/utils/trpc";

export function TradingShell() {
  const trpc = useTRPC();
  const [selectedAsset, setSelectedAsset] = useState<TradingAsset>("BTC");
  const [timeframe, setTimeframe] = useState<TradingTimeframe>("1m");
  const [ticketSuccessMessage, setTicketSuccessMessage] = useState<
    string | null
  >(null);
  const [ticketErrorMessage, setTicketErrorMessage] = useState<string | null>(
    null,
  );
  const [closeErrorMessage, setCloseErrorMessage] = useState<string | null>(
    null,
  );
  const [closingOrderId, setClosingOrderId] = useState<string | null>(null);

  const candleWindow = useCandleWindow(timeframe);

  const assetsQuery = useQuery({
    ...trpc.v1.asset.getAll.queryOptions(),
    refetchInterval: 4_000,
  });

  const candlesQuery = useQuery({
    ...trpc.v1.candle.getAll.queryOptions({
      asset: selectedAsset,
      ts: timeframe,
      startTime: candleWindow.startTime,
      endTime: candleWindow.endTime,
    }),
    refetchInterval: getCandleRefreshIntervalMs(timeframe),
  });

  const closedPositionsQuery = useQuery({
    ...trpc.v1.trades.getAll.queryOptions(),
    refetchInterval: 10_000,
  });

  const openPositions = useOpenPositionsPolling({
    enabled: true,
    pollIntervalMs: 5_000,
  });

  const openTradeMutation = useMutation(trpc.v1.trade.open.mutationOptions());
  const closeTradeMutation = useMutation(trpc.v1.trade.close.mutationOptions());

  const assets = useMemo(
    () => assetsQuery.data?.assets ?? [],
    [assetsQuery.data?.assets],
  );
  const candles = useMemo(
    () => candlesQuery.data?.candles ?? [],
    [candlesQuery.data?.candles],
  );
  const closedPositions = useMemo(
    () => closedPositionsQuery.data?.trades ?? [],
    [closedPositionsQuery.data?.trades],
  );

  useEffect(() => {
    if (assets.length === 0) {
      return;
    }

    const selectedStillAvailable = assets.some(
      (asset) => asset.symbol === selectedAsset,
    );

    if (selectedStillAvailable) {
      return;
    }

    setSelectedAsset(assets[0]?.symbol as TradingAsset);
  }, [assets, selectedAsset]);

  const selectedQuote = useMemo(
    () => assets.find((asset) => asset.symbol === selectedAsset),
    [assets, selectedAsset],
  );

  async function handleOpenTrade(input: TradeOpenInput) {
    setTicketSuccessMessage(null);
    setTicketErrorMessage(null);
    try {
      await openTradeMutation.mutateAsync(input);
      setTicketSuccessMessage("Position opened successfully");
      await Promise.all([
        openPositions.refresh(),
        closedPositionsQuery.refetch(),
      ]);
    } catch (error) {
      setTicketErrorMessage(getErrorMessage(error, "Failed to open position"));
    }
  }

  async function handleClosePosition(orderId: string) {
    setCloseErrorMessage(null);
    setTicketSuccessMessage(null);
    setClosingOrderId(orderId);
    try {
      await closeTradeMutation.mutateAsync({
        orderId,
      });
      setTicketSuccessMessage("Position closed successfully");
      await Promise.all([
        openPositions.refresh(),
        closedPositionsQuery.refetch(),
      ]);
    } catch (error) {
      setCloseErrorMessage(getErrorMessage(error, "Failed to close position"));
    } finally {
      setClosingOrderId(null);
    }
  }

  return (
    <div className="cfd-page min-h-screen px-4 py-5 md:px-6">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">CFD Trading Terminal</h1>
            <p className="cfd-muted text-sm">
              Track market candles, place leveraged positions, and manage
              orders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="cfd-secondary-button rounded-md px-3 py-1.5 text-sm font-medium"
            >
              Back to Home
            </Link>
            <ModelTheme />
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <AssetSelector
              assets={assets}
              selectedAsset={selectedAsset}
              timeframe={timeframe}
              isLoading={assetsQuery.isLoading}
              isRefreshing={assetsQuery.isRefetching}
              errorMessage={
                assetsQuery.error
                  ? getErrorMessage(assetsQuery.error, "Failed to load quotes")
                  : null
              }
              onAssetChange={setSelectedAsset}
              onTimeframeChange={setTimeframe}
            />
            <CandlestickChart
              asset={selectedAsset}
              timeframe={timeframe}
              candles={candles}
              isLoading={candlesQuery.isLoading}
              errorMessage={
                candlesQuery.error
                  ? getErrorMessage(
                      candlesQuery.error,
                      "Failed to load candles",
                    )
                  : null
              }
            />
          </div>

          <div className="space-y-4">
            <TradeTicket
              asset={selectedAsset}
              quote={selectedQuote}
              isSubmitting={openTradeMutation.isPending}
              successMessage={ticketSuccessMessage}
              errorMessage={ticketErrorMessage}
              onSubmit={handleOpenTrade}
            />
            {closeErrorMessage ? (
              <div className="cfd-surface cfd-negative-text rounded-xl border p-3 text-sm">
                {closeErrorMessage}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <OpenPositionsTable
            positions={openPositions.positions}
            isLoading={openPositions.isLoading}
            isRefreshing={openPositions.isRefreshing}
            errorMessage={openPositions.errorMessage}
            closingOrderId={closingOrderId}
            onClosePosition={handleClosePosition}
          />
          <TradeHistoryTable
            history={closedPositions}
            isLoading={closedPositionsQuery.isLoading}
            isRefreshing={closedPositionsQuery.isRefetching}
            errorMessage={
              closedPositionsQuery.error
                ? getErrorMessage(
                    closedPositionsQuery.error,
                    "Failed to load position history",
                  )
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}
