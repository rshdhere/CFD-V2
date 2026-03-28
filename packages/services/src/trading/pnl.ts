type PnlOrder = {
  type: "buy" | "sell";
  openPrice: number;
  margin: number;
  leverage: number;
};

export function calculatePnl(order: PnlOrder, closePrice: number): number {
  if (order.type === "buy") {
    return Math.round(
      ((closePrice - order.openPrice) / order.openPrice) *
        order.margin *
        order.leverage,
    );
  }

  return Math.round(
    ((order.openPrice - closePrice) / order.openPrice) *
      order.margin *
      order.leverage,
  );
}
