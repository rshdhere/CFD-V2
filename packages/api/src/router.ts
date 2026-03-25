import { router } from "./trpc.js";
import { userRouter } from "./routes/v1/user.js";
import { tradeRouter } from "./routes/v1/trade.js";
import { assetRouter } from "./routes/v1/asset.js";
import { tradesRouter } from "./routes/v1/trades.js";
import { candleRouter } from "./routes/v1/candles.js";

export const appRouter = router({
  v1: router({
    asset: assetRouter,
    candle: candleRouter,
    trade: tradeRouter,
    trades: tradesRouter,
    user: userRouter,
  }),
});

export type AppRouter = typeof appRouter;
