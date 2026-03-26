import cors from "cors";
import express from "express";
import { appRouter } from "./router.js";
import cookieParser from "cookie-parser";
import { CLIENT_URL } from "@CFD-V2/config";
import { createContext } from "./trpc/context.js";
import { refreshHandler } from "./handlers/refresh-handler.js";
import { logoutHandler } from "./handlers/logout-handler.js";
import * as trpcExpress from "@trpc/server/adapters/express";
import { handleEmailVerification } from "./handlers/email-handler.js";

export const app = express();

app.use(
  cors({
    credentials: true,
    origin: CLIENT_URL,
  }),
);

app.use(cookieParser());
app.get("/verify-email", handleEmailVerification);
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);
app.post("/refresh", refreshHandler);
app.post("/refresh/logout", logoutHandler);
