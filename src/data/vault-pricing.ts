import type { VaultPricing } from "@/types/pricing";

/**
 * VDC Vault pricing per TB per month (USD).
 * Source: Veeam published RRP.
 * Non-Core pricing is TBD — set to 0 as placeholder.
 */
export const VAULT_PRICING: VaultPricing[] = [
  { edition: "Foundation", tier: "Core", pricePerTbMonth: 14 },
  { edition: "Advanced", tier: "Core", pricePerTbMonth: 24 },
  { edition: "Foundation", tier: "Non-Core", pricePerTbMonth: 0 },
  { edition: "Advanced", tier: "Non-Core", pricePerTbMonth: 0 },
];

/**
 * Look up vault price for a given edition + tier combo.
 * Returns the pricing entry or undefined if not found.
 */
export function getVaultPrice(
  edition: string,
  tier: string,
): VaultPricing | undefined {
  return VAULT_PRICING.find((p) => p.edition === edition && p.tier === tier);
}
