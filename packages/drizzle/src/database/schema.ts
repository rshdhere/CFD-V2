import {
  boolean,
  index,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const orderTypeEnum = pgEnum("order_type", ["buy", "sell"]);

export const closeReasonEnum = pgEnum("close_reason", [
  "manual",
  "take_profit",
  "stop_loss",
  "liquidation",
]);

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", {
    length: 255,
  })
    .unique()
    .notNull(),
  password: varchar("password", {
    length: 255,
  }).notNull(),
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  balance: numeric("usd_balance", { precision: 18, scale: 2 })
    .notNull()
    .default("0"),
  asset: varchar("asset", { length: 4096 }).notNull().default("{}"),
});

export const refreshTokensTable = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => usersTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    tokenId: uuid("token_id").notNull(),
    tokenHash: varchar("token_hash", {
      length: 255,
    }).notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("refresh_tokens_user_id_idx").on(table.userId),
    index("refresh_tokens_expires_at_idx").on(table.expiresAt),
    uniqueIndex("refresh_tokens_token_id_idx").on(table.tokenId),
    uniqueIndex("refresh_tokens_token_hash_uidx").on(table.tokenHash),
  ],
);

export const ordersTable = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => usersTable.id, {
      onDelete: "cascade",
    }),
    type: orderTypeEnum("type").notNull(),
    margin: numeric("margin", { precision: 18, scale: 8 }).notNull(),
    leverage: numeric("leverage", { precision: 10, scale: 2 }).notNull(),
    asset: varchar("asset", { length: 20 }).notNull(),
    openPrice: numeric("open_price", { precision: 18, scale: 8 }).notNull(),
    takeProfit: numeric("take_profit", { precision: 18, scale: 8 }),
    stopLoss: numeric("stop_loss", { precision: 18, scale: 8 }),
    liquidationPrice: numeric("liquidation_price", {
      precision: 18,
      scale: 8,
    }),

    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("orders_user_id_idx").on(table.userId),
    index("orders_asset_idx").on(table.asset),
    index("orders_is_active_idx").on(table.isActive),
  ],
);

export const closedOrdersTable = pgTable(
  "closed_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),

    orderId: uuid("order_id")
      .references(() => ordersTable.id, { onDelete: "cascade" })
      .notNull(),

    type: orderTypeEnum("type").notNull(),

    asset: varchar("asset", { length: 20 }).notNull(),

    margin: numeric("margin", { precision: 18, scale: 8 }).notNull(),

    leverage: numeric("leverage", { precision: 10, scale: 2 }).notNull(),

    openPrice: numeric("open_price", { precision: 18, scale: 8 }).notNull(),

    closePrice: numeric("close_price", {
      precision: 18,
      scale: 8,
    }).notNull(),

    pnl: numeric("pnl", { precision: 18, scale: 8 }).notNull(),

    closeReason: closeReasonEnum("close_reason").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    closedAt: timestamp("closed_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("closed_orders_user_id_idx").on(table.userId),
    index("closed_orders_asset_idx").on(table.asset),
    index("closed_orders_closed_at_idx").on(table.closedAt),
  ],
);
