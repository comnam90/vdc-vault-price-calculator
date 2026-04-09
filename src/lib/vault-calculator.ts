import { MONTHS_PER_YEAR } from "@/lib/constants";
import { getVaultPrice } from "@/data/vault-pricing";
import type { CloudProvider, VaultEdition, VaultTier } from "@/types/region";
import type { VaultCostResult } from "@/types/calculator";

/**
 * Calculate the total cost of VDC Vault for a given capacity, term, edition,
 * and tier.
 *
 * Handles the following cases:
 * - Priced Core tiers: computes total = capacity * pricePerTbMonth * termMonths
 * - Non-Core (price === 0): returns null totals with pricingTbd: true
 * - Missing / invalid combos: returns null totals with pricingTbd: false
 */
export function calculateVaultCost(
  capacityTiB: number,
  termYears: number,
  edition: VaultEdition,
  tier: VaultTier,
  provider?: CloudProvider,
): VaultCostResult {
  const pricing = getVaultPrice(edition, tier, provider);

  if (!pricing) {
    return { total: null, perTbMonth: null, pricingTbd: false };
  }

  if (pricing.pricePerTbMonth === 0) {
    return { total: null, perTbMonth: null, pricingTbd: true };
  }

  const termMonths = termYears * MONTHS_PER_YEAR;
  const total = capacityTiB * pricing.pricePerTbMonth * termMonths;

  return { total, perTbMonth: pricing.pricePerTbMonth, pricingTbd: false };
}
