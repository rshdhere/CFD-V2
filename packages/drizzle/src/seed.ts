import "dotenv/config";
import pg from "pg";

const migrations = [
  {
    id: "0001_trades_symbol_trade_id",
    sql: `
      DROP INDEX IF EXISTS trades_trade_id_timestamp_uidx;
      CREATE UNIQUE INDEX IF NOT EXISTS trades_symbol_trade_id_uidx
        ON trades (symbol, trade_id);
    `,
  },
] as const;

async function seedDevData(client: pg.Client): Promise<void> {
  void client;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new pg.Client({ connectionString: url });
  await client.connect();

  try {
    for (const m of migrations) {
      await client.query(m.sql);
      console.log(`seed: applied migration ${m.id}`);
    }
    await seedDevData(client);
    console.log("seed: done");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
