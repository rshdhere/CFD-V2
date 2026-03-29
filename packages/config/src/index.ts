import "dotenv/config";
import jwt from "jsonwebtoken";

// JWT
export const JWT_SECRET = process.env.JWT_SECRET as jwt.Secret;
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
export const JWT_ALGORITHM = process.env.JWT_ALGORITHM as jwt.Algorithm;
export const EMAIL_JWT_EXPIRATION_TIME = process.env.EMAIL_JWT_EXPIRATION_TIME;
export const REFRESH_TOKEN_SECRET = process.env
  .REFRESH_TOKEN_SECRET as jwt.Secret;
export const REFRESH_TOKEN_LIFETIME_DAYS =
  process.env.REFRESH_TOKEN_LIFETIME_DAYS;

// RESEND
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const VERIFICATION_EMAIL_FROM = process.env.VERIFICATION_EMAIL_FROM;

// BINANCE
export const BINANCE_KLINE_LIMIT = 1000;
export const MAX_KLINE_REQUESTS = 50;
export const BINANCE_URL = "wss://stream.binance.com:9443/ws";
export const BATCH_TIMMINGS = 10_000;
export const PRECISION = 10_000;

// CLICKHOUSE (price-poller market trades)
const chDb = process.env.CLICKHOUSE_DATABASE?.trim();
export const CLICKHOUSE_DATABASE = chDb && chDb.length > 0 ? chDb : "default";
export const CLICKHOUSE_USERNAME =
  process.env.CLICKHOUSE_USERNAME?.trim() || "default";
export const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD ?? "";

// REDIS
export const REDIS_URL = process.env.REDIS_URL;
const ttl = Math.floor(Number(process.env.PRICE_SNAPSHOT_TTL_SEC));
export const PRICE_SNAPSHOT_TTL_SEC =
  Number.isFinite(ttl) && ttl > 0 ? ttl : 300;

// APP
export const WS_PORT = process.env.WS_PORT;
export const SERVER_URL = process.env.SERVER_URL;
export const SERVER_PORT = Number(process.env.SERVER_PORT);
export const CLIENT_URL = process.env.CLIENT_URL;
export const CLIENT_PORT = Number(process.env.CLIENT_PORT);
export const ENVIRONMENT = process.env.ENVIRONMENT;
export const runTime =
  ENVIRONMENT === "production" ? "production" : "development";
