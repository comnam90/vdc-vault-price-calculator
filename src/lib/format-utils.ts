const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a dollar value with full precision: $1,234.56 */
export function formatUSD(value: number): string {
  return USD_FORMATTER.format(value);
}

/**
 * Format a dollar value in compact notation.
 * Values ≥ 1M → "$1.2M", ≥ 1K → "$1.2K", else "$42".
 * Trailing ".0" is suppressed (e.g. "$2.0K" → "$2K").
 */
export function formatUSDCompact(value: number): string {
  if (value >= 1_000_000) {
    const compact = (value / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return `$${compact}M`;
  }
  if (value >= 1_000) {
    const compact = (value / 1_000).toFixed(1).replace(/\.0$/, "");
    return `$${compact}K`;
  }
  return `$${Math.round(value)}`;
}

/**
 * Format a per-TB-per-month price.
 * Returns "TBD" when value is null (Non-Core pricing not yet set).
 */
export function formatPerTbMonth(value: number | null): string {
  if (value === null) return "TBD";
  return `$${value}/TB/mo`;
}
