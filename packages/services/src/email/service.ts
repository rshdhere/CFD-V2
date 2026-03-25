import {
  MAX_VERIFICATION_EMAIL_RESENDS,
  verificationResendAttemptsByEmail,
} from "@CFD-V2/config";
import { TRPCError } from "@trpc/server";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// TODO: moving out from string to strict types
export function ConsumeVerificationResendAttempt(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const currentCount =
    verificationResendAttemptsByEmail.get(normalizedEmail) ?? 0;

  if (currentCount >= MAX_VERIFICATION_EMAIL_RESENDS) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "verification email can be resent only once",
    });
  }

  verificationResendAttemptsByEmail.set(normalizedEmail, currentCount + 1);
}
