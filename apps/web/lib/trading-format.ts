const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PRICE_FORMATTER = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

export function formatUsd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "--";
  }

  return USD_FORMATTER.format(value);
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "--";
  }

  return PRICE_FORMATTER.format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "--";
  }

  return NUMBER_FORMATTER.format(value);
}

export function formatLeverage(value: number): string {
  return `${value}x`;
}

export function formatOrderId(value: string): string {
  if (value.length <= 10) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function formatSignedPnl(value: number): string {
  if (!Number.isFinite(value)) {
    return "--";
  }

  const abs = Math.abs(value);
  if (value > 0) {
    return `+${USD_FORMATTER.format(abs)}`;
  }

  if (value < 0) {
    return `-${USD_FORMATTER.format(abs)}`;
  }

  return USD_FORMATTER.format(0);
}

export function getPnlTone(value: number): "positive" | "negative" | "neutral" {
  if (value > 0) {
    return "positive";
  }

  if (value < 0) {
    return "negative";
  }

  return "neutral";
}

export function getErrorMessage(
  error: unknown,
  fallback = "Unable to process request",
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string" && error.length > 0) {
    return error;
  }

  return fallback;
}
