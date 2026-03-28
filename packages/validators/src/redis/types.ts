/** JSON body stored under Redis key `price:{pair}` and published on the same channel. */
export type SpotQuoteMessage = {
  symbol: string;
  pair: string;
  bid: string;
  ask: string;
  decimals: number;
  ts: number;
};
