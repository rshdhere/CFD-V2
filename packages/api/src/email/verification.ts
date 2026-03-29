import type { EmailVerificationTokenPayload } from "../types/types.js";
import { EMAIL_VERIFICATION_TOKEN_INTENT } from "@CFD-V2/services/email/constants";
import { resolveClientOrigin } from "../http/client-origin.js";

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

export function getVerificationRedirectUrl(clientOrigin?: string) {
  const resolvedClientOrigin = resolveClientOrigin(clientOrigin);

  if (!resolvedClientOrigin) {
    return null;
  }

  try {
    const redirectUrl = new URL("/", resolvedClientOrigin);
    redirectUrl.searchParams.set("emailVerified", "1");
    return redirectUrl.toString();
  } catch {
    return null;
  }
}
