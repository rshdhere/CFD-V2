import { z } from "zod";
import { authSchema } from "./user/validation.js";
import { candlesSchema } from "./candles/validation.js";

export * from "./user/validation.js";

export type AuthSchema = z.infer<typeof authSchema.input>;
export type CandleQuery = z.infer<typeof candlesSchema.getAllInput>;
export type SignUpSchema = AuthSchema;
export type SignInSchema = AuthSchema;
export type ResendVerificationSchema = z.infer<
  typeof authSchema.resendVerificationInput
>;
