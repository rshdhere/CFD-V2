import { db, eq } from "@CFD-V2/drizzle";
import {
  closedOrdersTable,
  INITIAL_USER_USD_BALANCE,
  ordersTable,
  usersTable,
} from "@CFD-V2/drizzle/database";

export async function ensureInitialTradingBalance(
  userId: string,
  currentBalance: number,
) {
  if (Number.isFinite(currentBalance) && currentBalance > 0) {
    return currentBalance;
  }

  const [openOrder, closedOrder] = await Promise.all([
    db
      .select({ id: ordersTable.id })
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId))
      .limit(1),
    db
      .select({ id: closedOrdersTable.id })
      .from(closedOrdersTable)
      .where(eq(closedOrdersTable.userId, userId))
      .limit(1),
  ]);

  if (openOrder.length > 0 || closedOrder.length > 0) {
    return Number.isFinite(currentBalance) ? currentBalance : 0;
  }

  const [updatedUser] = await db
    .update(usersTable)
    .set({ balance: INITIAL_USER_USD_BALANCE })
    .where(eq(usersTable.id, userId))
    .returning({
      balance: usersTable.balance,
    });

  const updatedBalance = Number(updatedUser?.balance);
  if (Number.isFinite(updatedBalance)) {
    return updatedBalance;
  }

  return Number(INITIAL_USER_USD_BALANCE);
}
