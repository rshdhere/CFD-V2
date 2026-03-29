import { getClickHouseClient } from "../clickhouse.js";
import type { TradeBatchItem } from "../utils.js";

function dedupeBySymbolTradeId(items: TradeBatchItem[]): TradeBatchItem[] {
  const byKey = new Map<string, TradeBatchItem>();
  for (const t of items) {
    const key = `${t.symbol}:${t.tradeId}`;
    if (!byKey.has(key)) {
      byKey.set(key, t);
    }
  }
  return [...byKey.values()];
}

function toDateTime64UTC(d: Date): string {
  return d.toISOString().replace("T", " ").replace("Z", "");
}

export async function saveTradeBatch(tradeBatch: TradeBatchItem[]) {
  const rows = dedupeBySymbolTradeId(tradeBatch);
  if (rows.length === 0) {
    return;
  }

  const ch = getClickHouseClient();
  const values = rows.map((t) => ({
    symbol: t.symbol,
    trade_id: t.tradeId.toString(),
    price: Number(t.price),
    quantity: Number(t.quantity),
    timestamp: toDateTime64UTC(t.timestamp),
  }));

  try {
    await ch.insert({
      table: "trades",
      values,
      format: "JSONEachRow",
    });
    console.log(`[batch]: trades-batch inserted ${rows.length} row(s)`);
  } catch (e) {
    console.error("clickhouse insert failed", e);
    throw e;
  }
}
