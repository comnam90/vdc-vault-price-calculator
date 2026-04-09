import type { CloudProvider, VaultEdition, VaultTier } from "./region";

export interface CloudStoragePricing {
  /** Storage cost per GB per month */
  storagePerGbMonth: number;
  /** Write operations cost — per 10K ops (Azure) or per 1K ops (AWS) */
  writeOpsCost: number;
  /** Read operations cost — per 10K ops (Azure) or per 1K ops (AWS) */
  readOpsCost: number;
  /** Operations denominator: 10000 for Azure, 1000 for AWS */
  opsBatchSize: number;
  /** Data retrieval cost per GB (0 for hot/standard tiers) */
  retrievalPerGb: number;
  /** Internet egress cost per GB */
  egressPerGb: number;
}

export interface RegionCloudPricing {
  regionId: string;
  provider: CloudProvider;
  /** Azure Cool ZRS or AWS S3 Standard */
  option1: CloudStoragePricing;
  /** Azure Cool LRS or AWS S3 Infrequent Access */
  option2: CloudStoragePricing;
  option1Label: string;
  option2Label: string;
  /** True when ZRS redundancy is not available in this Azure region */
  option1Unavailable?: true;
}

export interface VaultPricing {
  edition: VaultEdition;
  tier: VaultTier;
  /** Cloud provider for provider-specific pricing (Non-Core). Absent means provider-agnostic. */
  provider?: CloudProvider;
  /** USD per TB per month. 0 means pricing TBD. */
  pricePerTbMonth: number;
}
