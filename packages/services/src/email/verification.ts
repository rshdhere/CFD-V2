import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { readFile } from "node:fs/promises";
import {
  EMAIL_JWT_EXPIRATION_TIME,
  JWT_ALGORITHM,
  JWT_SECRET,
  SERVER_URL,
} from "@CFD-V2/config";
import { createJwtSignOptions } from "@CFD-V2/utils";
import {
  EMAIL_VERIFICATION_TOKEN_INTENT,
  VERIFICATION_URL_PLACEHOLDER,
} from "./constants.js";

export const verificationEmailTemplatePromise = readFile(
  new URL("./email.html", import.meta.url),
  "utf8",
);

export function createEmailVerificationToken(userId: string) {
  if (!JWT_SECRET) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "JWT secret's are not baked in the server",
    });
  }

  return jwt.sign(
    {
      userId,
      intent: EMAIL_VERIFICATION_TOKEN_INTENT,
    },
    JWT_SECRET,
    createJwtSignOptions(JWT_ALGORITHM, EMAIL_JWT_EXPIRATION_TIME),
  );
}

export function createVerificationUrl(token: string) {
  if (!SERVER_URL) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "email verification configuration is missing - SERVER_URL",
    });
  }

  try {
    const verificationUrl = new URL("/verify-email", SERVER_URL);
    verificationUrl.searchParams.set("token", token);
    return verificationUrl.toString();
  } catch {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "SERVER_URL must be a valid absolute URL",
    });
  }
}

export async function renderVerificationEmailTemplate(verificationUrl: string) {
  let template: string;

  try {
    template = await verificationEmailTemplatePromise;
  } catch {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "email verification template is missing",
    });
  }

  if (!template.includes(VERIFICATION_URL_PLACEHOLDER)) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "email verification template is invalid",
    });
  }

  return template.replaceAll(VERIFICATION_URL_PLACEHOLDER, verificationUrl);
}
