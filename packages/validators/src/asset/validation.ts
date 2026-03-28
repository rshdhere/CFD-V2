import { z } from "zod";

const assetItemSchema = z
  .object({
    name: z.string(),
    symbol: z.string(),
    buyPrice: z.number(),
    sellPrice: z.number(),
    decimals: z.number(),
    imageUrl: z.url(),
  })
  .strict();

export const assetSchema = {
  getAssetsOutput: z
    .object({
      assets: z.array(assetItemSchema),
    })
    .strict(),
};
