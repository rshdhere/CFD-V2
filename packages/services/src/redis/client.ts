import { REDIS_URL } from "@CFD-V2/config";
import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

let client: RedisClient | null = null;
let connectPromise: Promise<RedisClient> | null = null;

async function getRedis(): Promise<RedisClient | null> {
  if (!REDIS_URL) {
    return null;
  }
  if (client?.isOpen) {
    return client;
  }
  if (!connectPromise) {
    const c = createClient({ url: REDIS_URL });
    c.on("error", (err) => console.error("Redis client error", err));
    connectPromise = c.connect().then(() => {
      client = c;
      return c;
    });
  }
  try {
    return await connectPromise;
  } catch {
    connectPromise = null;
    client = null;
    return null;
  }
}

export type PriceHash = {
  bid: string;
  ask: string;
};

export async function getPriceHash(pair: string): Promise<PriceHash | null> {
  const redis = await getRedis();
  if (!redis) {
    return null;
  }

  const raw = await redis.get(`price:${pair}`);
  if (!raw) {
    return null;
  }

  try {
    const data = JSON.parse(raw) as unknown;
    if (
      typeof data === "object" &&
      data !== null &&
      "bid" in data &&
      "ask" in data &&
      typeof (data as { bid: unknown }).bid === "string" &&
      typeof (data as { ask: unknown }).ask === "string"
    ) {
      return {
        bid: (data as PriceHash).bid,
        ask: (data as PriceHash).ask,
      };
    }
    return null;
  } catch {
    return null;
  }
}
