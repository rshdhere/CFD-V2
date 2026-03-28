import { z } from "zod";

export type TradeAsset = z.infer<typeof tradeSchema>["asset"];

export const tradeOpenOutputSchema = z
  .object({
    orderId: z.uuid(),
  })
  .strict();

export const tradeCloseInputSchema = z
  .object({
    orderId: z.uuid(),
  })
  .strict();

export const tradeCloseOutputSchema = z
  .object({
    pnl: z.number(),
    message: z.string(),
  })
  .strict();

export const tradeSchema = z.object({
  type: z.enum(["buy", "sell"]),
  margin: z.number().positive(),
  leverage: z.union([
    z.literal(1),
    z.literal(5),
    z.literal(10),
    z.literal(20),
    z.literal(100),
  ]),
  asset: z.enum(["BTC", "ETH", "SOL"]),
  takeProfit: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
});
