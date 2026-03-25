import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { verificationEmailTemplatePromise } from "@CFD-V2/services";
import {
  CLIENT_URL,
  EMAIL_JWT_EXPIRATION_TIME,
  EMAIL_VERIFICATION_TOKEN_INTENT,
  EmailVerificationTokenPayload,
  JWT_ALGORITHM,
  JWT_SECRET,
  SERVER_URL,
  VERIFICATION_URL_PLACEHOLDER,
} from "@CFD-V2/config";

// TODO: moving out from string to strict types
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
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: EMAIL_JWT_EXPIRATION_TIME,
    },
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

export function isEmailVerificationTokenPayload(
  value: unknown,
): value is EmailVerificationTokenPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<EmailVerificationTokenPayload>;
  return (
    typeof payload.userId === "string" &&
    payload.intent === EMAIL_VERIFICATION_TOKEN_INTENT
  );
}

export function getVerificationRedirectUrl() {
  if (!CLIENT_URL) {
    return null;
  }

  try {
    const redirectUrl = new URL("/", CLIENT_URL);
    redirectUrl.searchParams.set("emailVerified", "1");
    return redirectUrl.toString();
  } catch {
    return null;
  }
}
