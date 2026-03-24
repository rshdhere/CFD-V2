import { boolean, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("uuid").defaultRandom().primaryKey(),
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
