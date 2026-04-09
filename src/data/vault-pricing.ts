import type { CloudProvider, VaultEdition, VaultTier } from "@/types/region";
import type { VaultPricing } from "@/types/pricing";

/**
 * VDC Vault pricing per TB per month (USD).
 * Source: Veeam published RRP.
 *
 * Core pricing is provider-agnostic.
 * Non-Core pricing is provider-specific; the generic fallbacks (no provider)
 * remain TBD for providers where pricing has not yet been announced.
 */
export const VAULT_PRICING: VaultPricing[] = [
  // Core — provider-agnostic
  { edition: "Foundation", tier: "Core", pricePerTbMonth: 14 },
  { edition: "Advanced", tier: "Core", pricePerTbMonth: 24 },
  // Non-Core — generic TBD fallbacks (used when no provider-specific entry exists)
  { edition: "Foundation", tier: "Non-Core", pricePerTbMonth: 0 },
  { edition: "Advanced", tier: "Non-Core", pricePerTbMonth: 0 },
  // Non-Core — provider-specific published prices
  {
    edition: "Foundation",
    tier: "Non-Core",
    provider: "AWS",
    pricePerTbMonth: 19,
  },
  {
    edition: "Foundation",
    tier: "Non-Core",
    provider: "Azure",
    pricePerTbMonth: 24,
  },
  {
    edition: "Advanced",
    tier: "Non-Core",
    provider: "Azure",
    pricePerTbMonth: 40,
  },
];

/**
 * Look up vault price for a given edition + tier combo.
 * When a provider is supplied, a provider-specific entry is preferred over the
 * generic fallback. Returns undefined only if no entry exists at all.
 */
export function getVaultPrice(
  edition: VaultEdition,
  tier: VaultTier,
  provider?: CloudProvider,
): VaultPricing | undefined {
  if (provider) {
    const specific = VAULT_PRICING.find(
      (p) =>
        p.edition === edition && p.tier === tier && p.provider === provider,
    );
    if (specific) return specific;
  }
  return VAULT_PRICING.find(
    (p) => p.edition === edition && p.tier === tier && p.provider === undefined,
  );
}
