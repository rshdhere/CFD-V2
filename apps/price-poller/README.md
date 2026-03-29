# price-poller

Streams Binance aggTrades and writes batches to **ClickHouse** (not Postgres) so the primary database is not overloaded by high insert volume.

## Setup

1. Create the `trades` table: `bun run db:seed` (requires `CLICKHOUSE_URL` and optional `CLICKHOUSE_DATABASE`).
2. Environment variables:
   - `CLICKHOUSE_URL` — HTTP interface URL, e.g. `http://localhost:8123` or `https://user:pass@host:8443`
   - `CLICKHOUSE_DATABASE` — optional, defaults to `default`
   - `REDIS_URL` — for quote publishing (existing behavior)

```bash
bun install
bun run dev
```
