import "dotenv/config";
import { createClient } from "@clickhouse/client";
import { CLICKHOUSE_DATABASE, CLICKHOUSE_URL } from "@CFD-V2/config";

const TRADES_TABLE_DDL = `
CREATE TABLE IF NOT EXISTS trades
(
    symbol LowCardinality(String),
    trade_id String,
    price Int64,
    quantity Int64,
    \`timestamp\` DateTime64(3, 'UTC')
)
ENGINE = ReplacingMergeTree(\`timestamp\`)
ORDER BY (symbol, trade_id);
`;

async function main() {
  if (!CLICKHOUSE_URL) {
    throw new Error("CLICKHOUSE_URL is not set");
  }

  const client = createClient({
    url: CLICKHOUSE_URL,
    database: CLICKHOUSE_DATABASE,
  });

  try {
    await client.command({ query: TRADES_TABLE_DDL.trim() });
    console.log(`seed: trades table ready (${CLICKHOUSE_DATABASE})`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
