import { CLIENT_URL } from "@CFD-V2/config";
import type { EmailVerificationTokenPayload } from "../types/types.js";
import { EMAIL_VERIFICATION_TOKEN_INTENT } from "@CFD-V2/services/email/constants";

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
