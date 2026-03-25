import { z } from "zod";
import { authSchema } from "./user/validation.js";

export * from "./user/validation.js";

export type AuthSchema = z.infer<typeof authSchema.input>;
export type SignUpSchema = AuthSchema;
export type SignInSchema = AuthSchema;
export type ResendVerificationSchema = z.infer<
  typeof authSchema.resendVerificationInput
>;
