import { Client } from "pg";

// TODO: adding retry-logic
export const ensureDatabaseConnection = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL!,
  });
  try {
    await client.connect();
    console.log("database connection established.");
  } catch (error) {
    console.error("Database is down:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
};
