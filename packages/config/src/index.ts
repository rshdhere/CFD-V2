import jwt from "jsonwebtoken";

// JWT
export type HashingAlgorithm = "sha256";
export const DAY_IN_MS = 24 * 60 * 60 * 1000;
export const JWT_SECRET = Bun.env.JWT_SECRET as jwt.Secret;
export const JWT_ALGORITHM = Bun.env.JWT_ALGORITHM as jwt.Algorithm;
export const REFRESH_TOKEN_SECRET = Bun.env.REFRESH_TOKEN_SECRET as jwt.Secret;
export const ACCESS_TOKEN_EXPIRY = Number(Bun.env.ACCESS_TOKEN_EXPIRY);
export const EMAIL_JWT_EXPIRATION_TIME = Number(
  Bun.env.EMAIL_JWT_EXPIRATION_TIME,
);
export const REFRESH_TOKEN_LIFETIME_DAYS = Number(
  Bun.env.REFRESH_TOKEN_LIFETIME_DAYS,
);
export const HASHING_ALGORITHM = Bun.env.HASHING_ALGORITHM as HashingAlgorithm;
export type EncodingAlgorithm = "hex";
export const ENCODING_ALGORITHM = Bun.env
  .ENCODING_ALGORITHM as EncodingAlgorithm;

// RESEND
export type EmailVerificationTokenPayload = {
  userId: string;
  intent: typeof EMAIL_VERIFICATION_TOKEN_INTENT;
};
export const MAX_VERIFICATION_EMAIL_RESENDS = 1;
export const RESEND_API_KEY = Bun.env.RESEND_API_KEY;
export const EMAIL_VERIFICATION_TOKEN_INTENT = "verify-email";
export const VERIFICATION_URL_PLACEHOLDER = "{{VERIFICATION_URL}}";
export const VERIFICATION_EMAIL_FROM = Bun.env.VERIFICATION_EMAIL_FROM;
export const verificationResendAttemptsByEmail = new Map<string, number>();

export const SERVER_URL = Bun.env.SERVER_URL;
export const CLIENT_URL = Bun.env.CLIENT_URL;
export const ENVIRONMENT = Bun.env.ENVIRONMENT;
