import { PRICE_SNAPSHOT_TTL_SEC } from "@CFD-V2/config";
import type { SpotQuoteMessage } from "@CFD-V2/validators/redis/types";
import type { createClient } from "redis";
import { fromInternalPriceBigInt, isStreamSymbol } from "../utils.js";

type RedisClient = ReturnType<typeof createClient>;

export async function publishQuoteToRedis(
  redis: RedisClient,
  internalPrice: bigint,
  binanceSymbol: string,
  eventTime: Date,
) {
  if (!isStreamSymbol(binanceSymbol)) {
    return;
  }

  const realVal = fromInternalPriceBigInt(internalPrice);
  const bid = realVal.toFixed(2);
  const ask = (realVal * 1.01).toFixed(2);
  const ts = Math.floor(eventTime.getTime() / 1000);

  const baseSymbol = binanceSymbol.endsWith("USDT")
    ? binanceSymbol.slice(0, -4)
    : binanceSymbol;

  const message: SpotQuoteMessage = {
    symbol: baseSymbol,
    pair: binanceSymbol,
    bid,
    ask,
    decimals: 4,
    ts,
  };

  const channel = `price:${binanceSymbol}`;
  const body = JSON.stringify(message);

  await redis.publish(channel, body);
  await redis.set(channel, body, { EX: PRICE_SNAPSHOT_TTL_SEC });
}
