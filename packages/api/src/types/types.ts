import { EMAIL_VERIFICATION_TOKEN_INTENT } from "@CFD-V2/services/email/constants";

export type EmailVerificationTokenPayload = {
  userId: string;
  intent: typeof EMAIL_VERIFICATION_TOKEN_INTENT;
};
