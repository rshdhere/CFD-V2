import { and, db, eq } from "@CFD-V2/drizzle";
import { orderSchema } from "@CFD-V2/validators/trades";
import { privateProcedure, router } from "@/src/trpc.js";
import { closedOrdersTable, ordersTable } from "@CFD-V2/drizzle/database";

export const tradesRouter = router({
  open: privateProcedure
    .input(orderSchema.openInput)
    .output(orderSchema.openOutput)
    .mutation(async ({ ctx }) => {
      const userId = ctx.userId;

      const openOrders = await db
        .select()
        .from(ordersTable)
        .where(
          and(eq(ordersTable.userId, userId), eq(ordersTable.isActive, true)),
        );

      if (!openOrders.length) {
        return { trades: [] };
      }

      const formattedTrades = openOrders.map((order) => ({
        orderId: order.id,
        type: order.type,
        margin: Number(order.margin),
        leverage: Number(order.leverage),
        asset: order.asset,
        openPrice: Number(order.openPrice),
        takeProfit:
          order.takeProfit != null ? Number(order.takeProfit) : undefined,
        stopLoss: order.stopLoss != null ? Number(order.stopLoss) : undefined,
        liquidationPrice:
          order.liquidationPrice != null
            ? Number(order.liquidationPrice)
            : undefined,
      }));

      return { trades: formattedTrades };
    }),

  getAll: privateProcedure
    .input(orderSchema.getAllInput)
    .output(orderSchema.getAllOutput)
    .query(async ({ ctx }) => {
      const userId = ctx.userId;

      const closedOrders = await db
        .select()
        .from(closedOrdersTable)
        .where(eq(closedOrdersTable.userId, userId));

      if (!closedOrders.length) {
        return { trades: [] };
      }

      const formattedTrades = closedOrders.map((order) => ({
        orderId: order.orderId,
        type: order.type,
        margin: Number(order.margin),
        leverage: Number(order.leverage),
        openPrice: Number(order.openPrice),
        closePrice: Number(order.closePrice),
        pnl: Number(order.pnl),
      }));

      return { trades: formattedTrades };
    }),
});
