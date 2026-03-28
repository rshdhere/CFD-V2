import "dotenv/config";
export { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL!);
