import { TRPCError } from "@trpc/server";
import { and, db, eq, sql } from "@CFD-V2/drizzle";
import { calculatePnl } from "@CFD-V2/services/trading";
import { privateProcedure, router } from "@/src/trpc.js";
import { fetchBinanceBookTicker } from "@CFD-V2/services/market";
import {
  closedOrdersTable,
  ordersTable,
  usersTable,
} from "@CFD-V2/drizzle/database";
import {
  tradeCloseInputSchema,
  tradeCloseOutputSchema,
  tradeOpenOutputSchema,
  tradeSchema,
  type TradeAsset,
} from "@CFD-V2/validators/trade";

export const tradeRouter = router({
  open: privateProcedure
    .input(tradeSchema)
    .output(tradeOpenOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "user not found",
        });
      }

      let asset = input.asset;
      if (asset.endsWith("USDT")) {
        asset = asset.replace("USDT", "") as TradeAsset;
      }

      const basePriceData = await fetchBinanceBookTicker(asset);

      const openPriceRaw =
        input.type === "buy" ? basePriceData.ask : basePriceData.bid;

      const openPrice = Number(openPriceRaw);

      const usdBalance = Number(user.balance);
      if (
        !openPriceRaw ||
        Number.isNaN(openPrice) ||
        openPrice <= 0 ||
        !Number.isFinite(usdBalance) ||
        usdBalance < input.margin
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "invalid assets or insuffecient funds",
        });
      }

      const leverage = input.leverage;
      const liquidationPrice =
        input.type === "buy"
          ? Math.floor(openPrice * (1 - 1 / leverage))
          : Math.floor(openPrice * (1 + 1 / leverage));

      const marginStr = String(input.margin);

      return await db.transaction(async (tx) => {
        const [locked] = await tx
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, userId))
          .for("update")
          .limit(1);

        if (!locked) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "user not found",
          });
        }

        const lockedBalance = Number(locked.balance);
        if (!Number.isFinite(lockedBalance) || lockedBalance < input.margin) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "invalid assets or insuffecient funds",
          });
        }

        const debited = await tx
          .update(usersTable)
          .set({
            balance: sql`(${usersTable.balance}::numeric - ${marginStr}::numeric)::numeric(18,2)`,
          })
          .where(
            and(
              eq(usersTable.id, userId),
              sql`${usersTable.balance}::numeric >= ${marginStr}::numeric`,
            ),
          )
          .returning({ id: usersTable.id });

        if (debited.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "invalid assets or insuffecient funds",
          });
        }

        const [order] = await tx
          .insert(ordersTable)
          .values({
            userId,
            type: input.type,
            margin: marginStr,
            leverage: String(leverage),
            asset,
            openPrice: String(openPrice),
            takeProfit:
              input.takeProfit != null ? String(input.takeProfit) : undefined,
            stopLoss:
              input.stopLoss != null ? String(input.stopLoss) : undefined,
            liquidationPrice: String(liquidationPrice),
            isActive: true,
          })
          .returning({ orderId: ordersTable.id });

        if (!order) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "failed to create order",
          });
        }

        return { orderId: order.orderId };
      });
    }),

  close: privateProcedure
    .input(tradeCloseInputSchema)
    .output(tradeCloseOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const orderId = input.orderId;

      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "user not found",
        });
      }

      const [openOrder] = await db
        .select()
        .from(ordersTable)
        .where(
          and(
            eq(ordersTable.id, orderId),
            eq(ordersTable.userId, userId),
            eq(ordersTable.isActive, true),
          ),
        )
        .limit(1);

      if (!openOrder) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "order not found",
        });
      }

      const book = await fetchBinanceBookTicker(openOrder.asset as TradeAsset);
      const closePriceRaw = openOrder.type === "buy" ? book.bid : book.ask;
      const closePrice = Number(closePriceRaw);

      const marginNum = Number(openOrder.margin);
      const leverageNum = Number(openOrder.leverage);
      const openPriceNum = Number(openOrder.openPrice);

      if (
        !Number.isFinite(closePrice) ||
        closePrice <= 0 ||
        !Number.isFinite(marginNum) ||
        !Number.isFinite(leverageNum) ||
        !Number.isFinite(openPriceNum) ||
        openPriceNum <= 0
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid asset or missing price",
        });
      }

      const pnl = calculatePnl(
        {
          type: openOrder.type,
          openPrice: openPriceNum,
          margin: marginNum,
          leverage: leverageNum,
        },
        closePrice,
      );

      const pnlStr = String(pnl);

      return await db.transaction(async (tx) => {
        const [orderLocked] = await tx
          .select()
          .from(ordersTable)
          .where(
            and(
              eq(ordersTable.id, orderId),
              eq(ordersTable.userId, userId),
              eq(ordersTable.isActive, true),
            ),
          )
          .for("update")
          .limit(1);

        if (!orderLocked) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "order not found",
          });
        }

        const [lockedUser] = await tx
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, userId))
          .for("update")
          .limit(1);

        if (!lockedUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "user not found",
          });
        }

        await tx.insert(closedOrdersTable).values({
          userId,
          orderId,
          type: orderLocked.type,
          asset: orderLocked.asset,
          margin: orderLocked.margin,
          leverage: orderLocked.leverage,
          openPrice: orderLocked.openPrice,
          closePrice: String(closePrice),
          pnl: pnlStr,
          closeReason: "manual",
        });

        await tx
          .update(usersTable)
          .set({
            balance: sql`(${usersTable.balance}::numeric + ${pnlStr}::numeric + ${orderLocked.margin}::numeric)::numeric(18,2)`,
          })
          .where(eq(usersTable.id, userId));

        await tx
          .update(ordersTable)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(ordersTable.id, orderId));

        return {
          pnl,
          message: "position closed successfully",
        };
      });
    }),
});
