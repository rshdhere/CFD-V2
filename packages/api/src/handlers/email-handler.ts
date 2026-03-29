import jwt from "jsonwebtoken";
import { db, eq } from "@CFD-V2/drizzle";
import { Request, Response } from "express";
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from "@CFD-V2/config";
import { refreshTokensTable, usersTable } from "@CFD-V2/drizzle/database";
import {
  createRefreshToken,
  hashRefreshToken,
  refreshTokenCookieOptions,
} from "../auth/refresh-token.js";
import {
  getVerificationRedirectUrl,
  isEmailVerificationTokenPayload,
} from "../email/verification.js";

export async function handleEmailVerification(req: Request, res: Response) {
  const token =
    typeof req.query.token === "string" ? req.query.token : undefined;
  const clientOrigin =
    typeof req.query.clientOrigin === "string"
      ? req.query.clientOrigin
      : undefined;

  if (!token) {
    res.status(400).send("verification token is missing");
    return;
  }

  if (!JWT_SECRET) {
    res.status(500).send("server secret is not configured");
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!isEmailVerificationTokenPayload(decoded)) {
      res.status(400).send("invalid verification token");
      return;
    }

    const [verifiedUser] = await db
      .update(usersTable)
      .set({ isEmailVerified: true })
      .where(eq(usersTable.id, decoded.userId))
      .returning({ userId: usersTable.id });

    if (!verifiedUser) {
      res.status(404).send("user not found");
      return;
    }

    if (!REFRESH_TOKEN_SECRET) {
      res.status(500).send("refresh token secret is not configured");
      return;
    }

    const nextRefreshToken = createRefreshToken(
      decoded.userId,
      REFRESH_TOKEN_SECRET,
    );

    await db.insert(refreshTokensTable).values({
      userId: decoded.userId,
      tokenId: nextRefreshToken.tokenId,
      tokenHash: hashRefreshToken(nextRefreshToken.refreshToken),
      expiresAt: nextRefreshToken.expiresAt,
    });

    res.cookie(
      "refreshToken",
      nextRefreshToken.refreshToken,
      refreshTokenCookieOptions,
    );

    const redirectUrl = getVerificationRedirectUrl(clientOrigin);

    if (redirectUrl) {
      res.redirect(302, redirectUrl);
      return;
    }

    res.status(200).send("email verified successfully");
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "TokenExpiredError" ||
        error.name === "JsonWebTokenError" ||
        error.name === "NotBeforeError")
    ) {
      res.status(400).send("invalid verification token");
      return;
    }

    console.error("failed to verify email", error);
    res.status(500).send("failed to verify email");
  }
}
