import { calculateVaultCost } from "@/lib/vault-calculator";
import { calculateDiyCost } from "@/lib/diy-calculator";
import type {
  CalculatorInputs,
  ComparisonResult,
  VaultCostResult,
} from "@/types/calculator";
import type { Region } from "@/types/region";
import type { RegionCloudPricing } from "@/types/pricing";

const UNAVAILABLE: VaultCostResult = {
  total: null,
  perTbMonth: null,
  pricingTbd: false,
};

/**
 * Build a full cost comparison for a given set of calculator inputs.
 *
 * Vault availability is determined by the services listed in the region.
 * If an edition is absent from the region's vdc_vault list, it is returned
 * as unavailable (null totals, pricingTbd: false).
 */
export function buildComparison(
  inputs: CalculatorInputs,
  region: Region,
  cloudPricing: RegionCloudPricing,
): ComparisonResult {
  const { capacityTiB, termYears } = inputs;

  const foundationService = region.services.vdc_vault.find(
    (s) => s.edition === "Foundation",
  );
  const advancedService = region.services.vdc_vault.find(
    (s) => s.edition === "Advanced",
  );

  const vaultFoundation = foundationService
    ? calculateVaultCost(
        capacityTiB,
        termYears,
        foundationService.edition,
        foundationService.tier,
      )
    : UNAVAILABLE;

  const vaultAdvanced = advancedService
    ? calculateVaultCost(
        capacityTiB,
        termYears,
        advancedService.edition,
        advancedService.tier,
      )
    : UNAVAILABLE;

  const diyOption1 = calculateDiyCost(
    capacityTiB,
    termYears,
    cloudPricing.option1,
  );
  const diyOption2 = calculateDiyCost(
    capacityTiB,
    termYears,
    cloudPricing.option2,
  );

  return {
    vaultFoundation,
    vaultAdvanced,
    diyOption1,
    diyOption2,
    diyOption1Label: cloudPricing.option1Label,
    diyOption2Label: cloudPricing.option2Label,
  };
}
