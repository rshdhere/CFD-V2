import { tradesTable } from "@CFD-V2/drizzle/database";
import { db } from "../dbconfig.js";
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

export async function saveTradeBatch(tradeBatch: TradeBatchItem[]) {
  const rows = dedupeBySymbolTradeId(tradeBatch);
  if (rows.length === 0) {
    return;
  }

  const inserted = await db
    .insert(tradesTable)
    .values(
      rows.map((t) => ({
        symbol: t.symbol,
        price: t.price,
        tradeId: t.tradeId,
        timestamp: t.timestamp,
        quantity: t.quantity,
      })),
    )
    .onConflictDoNothing({
      target: [tradesTable.symbol, tradesTable.tradeId],
    })
    .returning({ id: tradesTable.id });

  console.log(
    `trades batch: attempted ${rows.length}, inserted ${inserted.length}`,
  );
}
