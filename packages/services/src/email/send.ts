import { Resend } from "resend";
import { TRPCError } from "@trpc/server";
import {
  RESEND_API_KEY,
  SERVER_URL,
  VERIFICATION_EMAIL_FROM,
} from "@CFD-V2/config";
import {
  createEmailVerificationToken,
  createVerificationUrl,
  renderVerificationEmailTemplate,
} from "./verification.js";

// TODO: moving out from string to strict types
export async function sendVerificationEmail(userId: string, email: string) {
  if (!RESEND_API_KEY || !VERIFICATION_EMAIL_FROM || !SERVER_URL) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "email verification configuration went missing while sending email to users",
    });
  }

  const verificationToken = createEmailVerificationToken(userId);
  const verificationUrl = createVerificationUrl(verificationToken);
  const html = await renderVerificationEmailTemplate(verificationUrl);
  const resend = new Resend(RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: VERIFICATION_EMAIL_FROM,
    to: [email],
    subject: "verify your email address",
    html,
  });

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "failed to send verification email",
    });
  }
}
