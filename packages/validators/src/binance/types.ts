/**
 * First fields of a Binance spot kline row (GET /api/v3/klines).
 * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#klinecandlestick-data
 */
export type BinanceKlineRow = readonly [
  openTime: number,
  open: string,
  high: string,
  low: string,
  close: string,
  ...(string | number)[],
];

export type BinanceBookTicker = {
  bidPrice: string;
  askPrice: string;
};
