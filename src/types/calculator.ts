export interface CalculatorInputs {
  regionId: string;
  termYears: number;
  capacityTiB: number;
  excludeEgress?: boolean;
  restorePercentage: number;
}

export interface CostBreakdown {
  storage: number;
  writeOps: number;
  readOps: number;
  dataRetrieval: number;
  internetEgress: number;
  total: number;
}

export interface VaultCostResult {
  /** Total cost over term, or null if edition not available / pricing TBD */
  total: number | null;
  /** Monthly cost per TB, or null */
  perTbMonth: number | null;
  /** True when tier is Non-Core and pricing is not yet set */
  pricingTbd: boolean;
  /** Overage cost when restore percentage exceeds the included 20% (Foundation only) */
  overage?: number;
}

export interface ComparisonResult {
  vaultFoundation: VaultCostResult;
  vaultAdvanced: VaultCostResult;
  diyOption1: CostBreakdown;
  diyOption2: CostBreakdown;
  diyOption1Label: string;
  diyOption2Label: string;
  /** True when ZRS is not available in the selected Azure region */
  diyOption1Unavailable?: true;
}
