import { BINANCE_KLINE_LIMIT, MAX_KLINE_REQUESTS } from "@CFD-V2/config";
import { BinanceBookTicker, BinanceKlineRow } from "@CFD-V2/validators/binance";
import { CandleQuery } from "@CFD-V2/validators";
import { CandleBar } from "@CFD-V2/validators/candles/types";
import { TradeAsset } from "@CFD-V2/validators/trade";
import { TRPCError } from "@trpc/server";

function isBinanceKlineRow(row: unknown): row is BinanceKlineRow {
  if (!Array.isArray(row) || row.length < 5) {
    return false;
  }
  const [openTime, open, high, low, close] = row;
  return (
    typeof openTime === "number" &&
    typeof open === "string" &&
    typeof high === "string" &&
    typeof low === "string" &&
    typeof close === "string"
  );
}

function parseKlineRow(row: unknown): CandleBar | null {
  if (!isBinanceKlineRow(row)) {
    return null;
  }
  const [openTime, open, high, low, close] = row;
  return {
    timestamp: Math.floor(openTime / 1000),
    open: Number(open),
    high: Number(high),
    low: Number(low),
    close: Number(close),
    decimal: 4,
  };
}

export async function fetchBinanceKlines(
  input: CandleQuery,
): Promise<CandleBar[]> {
  const symbol = `${input.asset}USDT`;
  const startMs = input.startTime * 1000;
  const endMs = input.endTime * 1000;

  const candles: CandleBar[] = [];
  let cursor = startMs;
  let requests = 0;

  while (cursor < endMs && requests < MAX_KLINE_REQUESTS) {
    requests += 1;

    const url = new URL("https://api.binance.com/api/v3/klines");
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("interval", input.ts);
    url.searchParams.set("startTime", String(cursor));
    url.searchParams.set("endTime", String(endMs));
    url.searchParams.set("limit", String(BINANCE_KLINE_LIMIT));

    let res: Response;
    try {
      res = await fetch(url);
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "failed to fetch candles",
      });
    }

    if (!res.ok) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "failed to fetch candles",
      });
    }

    const payload: unknown = await res.json();
    if (!Array.isArray(payload) || payload.length === 0) {
      break;
    }

    const raw = payload;

    for (const row of raw) {
      const bar = parseKlineRow(row);
      if (
        bar &&
        !Number.isNaN(bar.open) &&
        !Number.isNaN(bar.high) &&
        !Number.isNaN(bar.low) &&
        !Number.isNaN(bar.close)
      ) {
        candles.push(bar);
      }
    }

    const last = raw[raw.length - 1];
    if (!isBinanceKlineRow(last)) {
      break;
    }

    cursor = last[0] + 1;
    if (raw.length < BINANCE_KLINE_LIMIT) {
      break;
    }
  }

  return candles.filter(
    (c) => c.timestamp >= input.startTime && c.timestamp <= input.endTime,
  );
}

export async function fetchBinanceBookTicker(
  asset: TradeAsset,
): Promise<{ bid: string; ask: string }> {
  const symbol = `${asset}USDT`;
  let res: Response;
  try {
    res = await fetch(
      `https://api.binance.com/api/v3/ticker/bookTicker?symbol=${symbol}`,
    );
  } catch {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "could not fetch market price",
    });
  }

  if (!res.ok) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "could not fetch market price",
    });
  }

  const data = (await res.json()) as BinanceBookTicker;
  if (!data.bidPrice || !data.askPrice) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "could not fetch market price",
    });
  }

  return { bid: data.bidPrice, ask: data.askPrice };
}
