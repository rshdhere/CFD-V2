import jwt from "jsonwebtoken";
import { Response } from "express";
import {
  ACCESS_TOKEN_EXPIRY,
  JWT_ALGORITHM,
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
} from "@CFD-V2/config";
import { db } from "@CFD-V2/drizzle";
import { refreshTokensTable } from "@CFD-V2/drizzle/database";
import { TRPCError } from "@trpc/server";
import {
  createRefreshToken,
  hashRefreshToken,
  refreshTokenCookieOptions,
} from "./refresh-token.js";

export async function createSessionTokens(userId: string, res: Response) {
  if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "JWT secret's are not baked in the server",
    });
  }

  const { refreshToken, tokenId, expiresAt } = createRefreshToken(
    userId,
    REFRESH_TOKEN_SECRET,
  );

  await db.insert(refreshTokensTable).values({
    userId,
    tokenId,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt,
  });

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  const accessToken = jwt.sign({ userId }, JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  return { accessToken };
}
