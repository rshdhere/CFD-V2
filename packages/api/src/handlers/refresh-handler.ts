import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { and, db, eq } from "@CFD-V2/drizzle";
import { refreshTokensTable, usersTable } from "@CFD-V2/drizzle/database";
import {
  ACCESS_TOKEN_EXPIRY,
  JWT_ALGORITHM,
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
} from "@CFD-V2/config";
import { createJwtSignOptions } from "@CFD-V2/utils";
import {
  createRefreshToken,
  hashRefreshToken,
  isRefreshTokenPayload,
  refreshTokenCookieClearOptions,
  refreshTokenCookieOptions,
  refreshTokenHashMatches,
} from "../auth/refresh-token.js";

export async function refreshHandler(req: Request, res: Response) {
  const refreshToken: string | undefined = req.cookies["refreshToken"];

  // 200 (not 401): anonymous users hit this on every load via initAuth; 401 logs as a console error.
  if (!refreshToken) {
    res.status(200).json({ message: "no session" });
    return;
  }

  if (!REFRESH_TOKEN_SECRET || !JWT_SECRET) {
    res.status(500).json({ message: "server secrets are not configured" });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    if (!isRefreshTokenPayload(decoded)) {
      res.clearCookie("refreshToken", refreshTokenCookieClearOptions);
      res.status(401).json({ message: "invalid refresh token" });
      return;
    }

    const [user] = await db
      .select({
        isEmailVerified: usersTable.isEmailVerified,
      })
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId));

    if (!user || !user.isEmailVerified) {
      res.clearCookie("refreshToken", refreshTokenCookieClearOptions);
      res.status(401).json({ message: "email is not verified" });
      return;
    }

    const [storedRefreshToken] = await db
      .select({
        refreshTokenId: refreshTokensTable.id,
        tokenHash: refreshTokensTable.tokenHash,
        expiresAt: refreshTokensTable.expiresAt,
      })
      .from(refreshTokensTable)
      .where(
        and(
          eq(refreshTokensTable.userId, decoded.userId),
          eq(refreshTokensTable.tokenId, decoded.tokenId),
        ),
      );

    if (
      !storedRefreshToken ||
      !refreshTokenHashMatches(refreshToken, storedRefreshToken.tokenHash)
    ) {
      res.clearCookie("refreshToken", refreshTokenCookieClearOptions);
      res.status(401).json({ message: "invalid refresh token" });
      return;
    }

    if (storedRefreshToken.expiresAt.getTime() <= Date.now()) {
      await db
        .delete(refreshTokensTable)
        .where(eq(refreshTokensTable.id, storedRefreshToken.refreshTokenId));

      res.clearCookie("refreshToken", refreshTokenCookieClearOptions);
      res.status(401).json({ message: "refresh token expired" });
      return;
    }

    const rotatedRefreshToken = createRefreshToken(
      decoded.userId,
      REFRESH_TOKEN_SECRET,
    );

    await db
      .update(refreshTokensTable)
      .set({
        tokenId: rotatedRefreshToken.tokenId,
        tokenHash: hashRefreshToken(rotatedRefreshToken.refreshToken),
        expiresAt: rotatedRefreshToken.expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(refreshTokensTable.id, storedRefreshToken.refreshTokenId));

    res.cookie(
      "refreshToken",
      rotatedRefreshToken.refreshToken,
      refreshTokenCookieOptions,
    );

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET,
      createJwtSignOptions(JWT_ALGORITHM, ACCESS_TOKEN_EXPIRY),
    );

    res.json({ accessToken, message: "accessToken refreshed!" });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "TokenExpiredError" ||
        error.name === "JsonWebTokenError" ||
        error.name === "NotBeforeError")
    ) {
      await db
        .delete(refreshTokensTable)
        .where(
          eq(refreshTokensTable.tokenHash, hashRefreshToken(refreshToken)),
        );

      res.clearCookie("refreshToken", refreshTokenCookieClearOptions);
      return res.status(401).json({ message: "Un-Authorized" });
    }

    console.error("failed to refresh access token", error);
    return res.status(500).json({ message: "failed to refresh access token" });
  }
}
