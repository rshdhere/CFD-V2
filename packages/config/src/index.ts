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

// APP
export const SERVER_URL = Bun.env.SERVER_URL;
export const SERVER_PORT = Number(Bun.env.SERVER_PORT);
export const CLIENT_URL = Bun.env.CLIENT_URL;
export const CLIENT_PORT = Number(Bun.env.CLIENT_PORT);
export const ENVIRONMENT = Bun.env.ENVIRONMENT;
export const runTime =
  ENVIRONMENT === "production" ? "production" : "development";
