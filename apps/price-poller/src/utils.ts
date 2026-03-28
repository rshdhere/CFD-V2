export type TradeBatchItem = {
  symbol: string;
  price: bigint;
  tradeId: bigint;
  timestamp: Date;
  quantity: bigint;
};

import { PRECISION } from "@CFD-V2/config";

export const BINANCE_STREAMS = [
  "btcusdt@aggTrade",
  "ethusdt@aggTrade",
  "solusdt@aggTrade",
] as const;

export function toInternalPrice(price: number | string): number {
  return Math.round(parseFloat(String(price)) * PRECISION);
}

export function fromInternalPrice(price: number): number {
  return price / PRECISION;
}

export function toDisplayPrice(price: bigint): string {
  return (Number(price) / PRECISION).toFixed(2);
}

export function toInternalPriceBigInt(price: number | string): bigint {
  return BigInt(Math.round(parseFloat(String(price)) * PRECISION));
}

export function fromInternalPriceBigInt(price: bigint): number {
  return Number(price) / PRECISION;
}

export const STREAM_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"] as const;
export type StreamSymbol = (typeof STREAM_SYMBOLS)[number];

export function isStreamSymbol(s: string): s is StreamSymbol {
  return (STREAM_SYMBOLS as readonly string[]).includes(s);
}
