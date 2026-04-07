export interface CalculatorInputs {
  regionId: string;
  termYears: number;
  capacityTiB: number;
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
}

export interface ComparisonResult {
  vaultFoundation: VaultCostResult;
  vaultAdvanced: VaultCostResult;
  diyOption1: CostBreakdown;
  diyOption2: CostBreakdown;
  diyOption1Label: string;
  diyOption2Label: string;
}
