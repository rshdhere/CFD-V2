import jwt, { type JwtPayload } from "jsonwebtoken";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { DAY_IN_MS, HASHING_ALGORITHM, DEFAULT_ENCODING } from "@CFD-V2/utils";
import {
  createJwtSignOptions,
  ENVIRONMENT,
  REFRESH_TOKEN_LIFETIME_DAYS,
} from "@CFD-V2/config";

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: ENVIRONMENT === "production",
  sameSite: "strict" as const,
  maxAge: Number(REFRESH_TOKEN_LIFETIME_DAYS) * DAY_IN_MS,
  path: "/refresh",
};

export const refreshTokenCookieClearOptions = {
  httpOnly: true,
  secure: ENVIRONMENT === "production",
  sameSite: "strict" as const,
  path: "/refresh",
};

type RefreshTokenPayload = JwtPayload & {
  userId: string;
  tokenId: string;
};

export function createRefreshToken(userId: string, secret: jwt.Secret) {
  const tokenId = randomUUID();

  return {
    refreshToken: jwt.sign(
      { userId, tokenId },
      secret,
      createJwtSignOptions(`${REFRESH_TOKEN_LIFETIME_DAYS}d`),
    ),
    tokenId,
    expiresAt: new Date(
      Date.now() + Number(REFRESH_TOKEN_LIFETIME_DAYS) * DAY_IN_MS,
    ),
  };
}

export function hashRefreshToken(refreshToken: string) {
  return createHash(HASHING_ALGORITHM)
    .update(refreshToken)
    .digest(DEFAULT_ENCODING);
}

export function isRefreshTokenPayload(
  payload: string | JwtPayload,
): payload is RefreshTokenPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof payload.userId === "string" &&
    typeof payload.tokenId === "string"
  );
}

export function refreshTokenHashMatches(
  refreshToken: string,
  storedHash: string,
) {
  const computedHashBuffer = Buffer.from(hashRefreshToken(refreshToken));
  const storedHashBuffer = Buffer.from(storedHash);

  if (computedHashBuffer.length !== storedHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(computedHashBuffer, storedHashBuffer);
}
