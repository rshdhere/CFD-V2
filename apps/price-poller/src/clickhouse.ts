import { createClient, type ClickHouseClient } from "@clickhouse/client";
import {
  CLICKHOUSE_DATABASE,
  CLICKHOUSE_PASSWORD,
  CLICKHOUSE_USERNAME,
} from "@CFD-V2/config";

let client: ClickHouseClient | undefined;

export function createClickHouseClient(): ClickHouseClient {
  if (!CLICKHOUSE_PASSWORD) {
    throw new Error("CLICKHOUSE_PASSWORD is not set");
  }
  return createClient({
    database: CLICKHOUSE_DATABASE,
    username: CLICKHOUSE_USERNAME,
    password: CLICKHOUSE_PASSWORD,
  });
}

export function getClickHouseClient(): ClickHouseClient {
  if (!client) {
    client = createClickHouseClient();
  }
  return client;
}

/** Verifies the server is reachable and credentials work (SELECT-based ping). */
export async function ensureClickHouseConnected(): Promise<void> {
  const ch = getClickHouseClient();
  const result = await ch.ping({ select: true });
  if (!result.success) {
    throw result.error;
  }
}
