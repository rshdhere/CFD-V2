import type { AppRouter } from "@CFD-V2/api/trpc";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

export type TradingAsset = RouterInputs["v1"]["trade"]["open"]["asset"];
export type TradingTimeframe = RouterInputs["v1"]["candle"]["getAll"]["ts"];
export type TradeDirection = RouterInputs["v1"]["trade"]["open"]["type"];
export type TradeLeverage = RouterInputs["v1"]["trade"]["open"]["leverage"];

export type TradeOpenInput = RouterInputs["v1"]["trade"]["open"];

export type AssetQuote =
  RouterOutputs["v1"]["asset"]["getAll"]["assets"][number];
export type Candle = RouterOutputs["v1"]["candle"]["getAll"]["candles"][number];
export type OpenPosition =
  RouterOutputs["v1"]["trades"]["open"]["trades"][number];
export type ClosedPosition =
  RouterOutputs["v1"]["trades"]["getAll"]["trades"][number];
export type TradingBalance = RouterOutputs["v1"]["user"]["balance"]["balance"];

export const TRADING_TIMEFRAMES: TradingTimeframe[] = ["1m", "1d", "1w"];
export const TRADING_LEVERAGES: TradeLeverage[] = [1, 5, 10, 20, 100];
