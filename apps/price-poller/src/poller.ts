import { BATCH_TIMMINGS, BINANCE_URL, REDIS_URL } from "@CFD-V2/config";
import { createClient } from "redis";
import { ensureClickHouseConnected } from "./clickhouse.js";
import { saveTradeBatch } from "./ops/db-ops.js";
import { publishQuoteToRedis } from "./ops/redis-ops.js";
import {
  BINANCE_STREAMS,
  toInternalPriceBigInt,
  type TradeBatchItem,
} from "./utils.js";

const redisUrl = REDIS_URL ?? "redis://127.0.0.1:6379";

type AggTradeMessage = {
  e?: string;
  p?: string;
  q?: string;
  s?: string;
  T?: number;
  a?: number | string;
};

export async function main() {
  const redis = createClient({ url: redisUrl });
  redis.on("error", (err) => console.error("Redis client error", err));
  await redis.connect();
  console.log("[redis]: connected to redis");

  await ensureClickHouseConnected();
  console.log("[clickhouse]: connected to clickhouse");

  let tradeBatch: TradeBatchItem[] = [];

  const batchProcess = setInterval(() => {
    const batchSave = tradeBatch;
    tradeBatch = [];
    void saveTradeBatch(batchSave);
  }, BATCH_TIMMINGS);

  const ws = new WebSocket(BINANCE_URL);

  ws.addEventListener("open", () => {
    console.log("[binance]: connected to binance websocket");
    ws.send(
      JSON.stringify({
        method: "SUBSCRIBE",
        params: BINANCE_STREAMS,
        id: 1,
      }),
    );
  });

  ws.addEventListener("message", (event) => {
    if (typeof event.data !== "string") {
      return;
    }

    let messages: unknown;
    try {
      messages = JSON.parse(event.data);
    } catch {
      return;
    }

    const msg = messages as AggTradeMessage;
    if (msg.e !== "aggTrade") {
      return;
    }

    const p = msg.p;
    const q = msg.q;
    const s = msg.s;
    const T = msg.T;
    const a = msg.a;
    if (p == null || q == null || s == null || T == null || a == null) {
      return;
    }

    const intPrice = toInternalPriceBigInt(p);
    const intQty = toInternalPriceBigInt(q);
    const eventTime = new Date(T);

    void publishQuoteToRedis(redis, intPrice, s, eventTime);

    tradeBatch.push({
      symbol: s,
      price: intPrice,
      quantity: intQty,
      tradeId: BigInt(a),
      timestamp: eventTime,
    });
  });

  ws.addEventListener("error", (err) => {
    console.log("websocket error", err);
  });

  ws.addEventListener("close", () => {
    console.log("websocket closed");
    clearInterval(batchProcess);
    void saveTradeBatch(tradeBatch);
    void redis.quit();
  });
}
