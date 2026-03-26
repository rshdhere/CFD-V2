import { app } from "@CFD-V2/api";
import { runTime, SERVER_PORT } from "@CFD-V2/config";
import { ensureDatabaseConnection } from "@CFD-V2/drizzle/health";

export const main = async () => {
  await ensureDatabaseConnection();

  app.listen(SERVER_PORT, () => {
    console.log(
      `server is running in ${runTime}-mode on http://localhost:${SERVER_PORT}`,
    );
  });
};
