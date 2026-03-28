import jwt from "jsonwebtoken";

// JWT
export const JWT_SECRET = Bun.env.JWT_SECRET as jwt.Secret;
export const ACCESS_TOKEN_EXPIRY = Bun.env.ACCESS_TOKEN_EXPIRY;
export const JWT_ALGORITHM = Bun.env.JWT_ALGORITHM as jwt.Algorithm;
export const EMAIL_JWT_EXPIRATION_TIME = Bun.env.EMAIL_JWT_EXPIRATION_TIME;
export const REFRESH_TOKEN_SECRET = Bun.env.REFRESH_TOKEN_SECRET as jwt.Secret;
export const REFRESH_TOKEN_LIFETIME_DAYS = Bun.env.REFRESH_TOKEN_LIFETIME_DAYS;

// RESEND
export const RESEND_API_KEY = Bun.env.RESEND_API_KEY;
export const VERIFICATION_EMAIL_FROM = Bun.env.VERIFICATION_EMAIL_FROM;

// BINANCE
export const BINANCE_KLINE_LIMIT = 1000;
export const MAX_KLINE_REQUESTS = 50;
export const BINANCE_URL = "wss://stream.binance.com:9443/ws";
export const BATCH_TIMMINGS = 10_000;
export const PRECISION = 10_000;

// REDIS
export const REDIS_URL = Bun.env.REDIS_URL;
const ttl = Math.floor(Number(Bun.env.PRICE_SNAPSHOT_TTL_SEC));
export const PRICE_SNAPSHOT_TTL_SEC =
  Number.isFinite(ttl) && ttl > 0 ? ttl : 300;

// APP
export const WS_PORT = Bun.env.WS_PORT;
export const SERVER_URL = Bun.env.SERVER_URL;
export const SERVER_PORT = Number(Bun.env.SERVER_PORT);
export const CLIENT_URL = Bun.env.CLIENT_URL;
export const CLIENT_PORT = Number(Bun.env.CLIENT_PORT);
export const ENVIRONMENT = Bun.env.ENVIRONMENT;
export const runTime =
  ENVIRONMENT === "production" ? "production" : "development";
