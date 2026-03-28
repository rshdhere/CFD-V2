import { z } from "zod";

const candleItemSchema = z
  .object({
    timestamp: z.number().int().nonnegative(),
    open: z.number(),
    high: z.number(),
    low: z.number(),
    close: z.number(),
    decimal: z.literal(4),
  })
  .strict();

export const candlesSchema = {
  getAllInput: z
    .object({
      ts: z.enum(["1m", "1d", "1w"]),
      asset: z.enum(["BTC", "ETH", "SOL"]),
      startTime: z.number().int().nonnegative(),
      endTime: z.number().int().nonnegative(),
    })
    .strict()
    .refine((value) => value.startTime <= value.endTime, {
      message: "startTime cannot be greater than endTime",
      path: ["endTime"],
    }),
  getAllOutput: z
    .object({
      candles: z.array(candleItemSchema),
    })
    .strict(),
};
