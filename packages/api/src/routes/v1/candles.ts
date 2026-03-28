import { TRPCError } from "@trpc/server";
import { fetchBinanceKlines } from "@CFD-V2/services/market";
import { candlesSchema } from "@CFD-V2/validators/candles";
import { privateProcedure, router } from "@/src/trpc.js";

export const candleRouter = router({
  getAll: privateProcedure
    .input(candlesSchema.getAllInput)
    .output(candlesSchema.getAllOutput)
    .query(async ({ input }) => {
      try {
        const candles = await fetchBinanceKlines(input);
        return { candles };
      } catch (e) {
        if (e instanceof TRPCError) {
          throw e;
        }
        console.error("failed to fetch candles", e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "failed to fetch candles",
        });
      }
    }),
});
