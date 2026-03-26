import { JWT_SECRET } from "@CFD-V2/config";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import * as trpcExpress from "@trpc/server/adapters/express";
import { db, eq } from "@CFD-V2/drizzle";
import { usersTable } from "@CFD-V2/drizzle/database";

export async function createContext({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      userId: undefined,
      res,
    };
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return {
      userId: undefined,
      res,
    };
  }

  if (!JWT_SECRET) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "the JWT_SECRET went missing",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.userId !== "string"
    ) {
      return {
        userId: undefined,
        res,
      };
    }

    const [user] = await db
      .select({
        userId: usersTable.id,
        isEmailVerified: usersTable.isEmailVerified,
      })
      .from(usersTable)
      .where(eq(usersTable.id, decoded.userId));

    if (!user || !user.isEmailVerified) {
      return {
        userId: undefined,
        res,
      };
    }

    return {
      userId: user.userId,
      res,
    };
  } catch {
    return {
      userId: undefined,
      res,
    };
  }
}
