import { z } from "zod";

const tradesOutputSchema = z
  .object({
    orderId: z.string().min(1),
    type: z.enum(["buy", "sell"]),
    margin: z.number().positive(),
    leverage: z.number().positive(),
    asset: z.string().min(1),
    openPrice: z.number().positive(),
    takeProfit: z.number().positive().optional(),
    stopLoss: z.number().positive().optional(),
    liquidationPrice: z.number().positive().optional(),
  })
  .strict();

const closedTradesOutputSchema = z
  .object({
    orderId: z.string().min(1),
    type: z.enum(["buy", "sell"]),
    margin: z.number().positive(),
    leverage: z.number().positive(),
    openPrice: z.number().positive(),
    closePrice: z.number().positive(),
    pnl: z.number(),
  })
  .strict();

export const orderSchema = {
  openInput: z.void(),
  getAllInput: z.void(),
  trade: tradesOutputSchema,
  closedTrade: closedTradesOutputSchema,
  openOutput: z
    .object({
      trades: z.array(tradesOutputSchema),
    })
    .strict(),
  getAllOutput: z
    .object({
      trades: z.array(closedTradesOutputSchema),
    })
    .strict(),
};
