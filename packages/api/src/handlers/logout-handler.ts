import { db, eq } from "@CFD-V2/drizzle";
import { Request, Response } from "express";
import {
  hashRefreshToken,
  refreshTokenCookieClearOptions,
} from "../auth/refresh-token.js";
import { refreshTokensTable } from "@CFD-V2/drizzle/database";

export async function logoutHandler(req: Request, res: Response) {
  const refreshToken = req.cookies["refreshToken"];
  res.clearCookie("refreshToken", refreshTokenCookieClearOptions);

  if (!refreshToken) {
    res.json({ message: "logged out" });
    return;
  }

  try {
    await db
      .delete(refreshTokensTable)
      .where(eq(refreshTokensTable.tokenHash, hashRefreshToken(refreshToken)));

    res.json({ message: "logged out" });
  } catch (error) {
    console.error("failed to logout refresh token", error);
    res.status(500).json({ message: "failed to logout" });
  }
}
