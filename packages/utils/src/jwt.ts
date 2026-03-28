import type { Algorithm, SignOptions } from "jsonwebtoken";

export function createJwtSignOptions(
  algorithm: Algorithm,
  expiresIn?: string | number,
): SignOptions {
  const signOptions: SignOptions = { algorithm };

  if (expiresIn !== undefined) {
    signOptions.expiresIn = expiresIn as SignOptions["expiresIn"];
  }

  return signOptions;
}
