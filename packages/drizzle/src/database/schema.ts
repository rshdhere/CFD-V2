import {
  boolean,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

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
