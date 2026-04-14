import {
  TIB_TO_GB,
  TIB_TO_MB,
  OPERATION_SIZE_MB,
  ANNUAL_READ_FACTOR,
  ANNUAL_EGRESS_FACTOR,
  MONTHS_PER_YEAR,
} from "@/lib/constants";
import type { CloudStoragePricing } from "@/types/pricing";
import type { CostBreakdown } from "@/types/calculator";

/** Storage cost = capacity × TIB_TO_GB × ratePerGbMonth × termMonths */
export function calculateStorageCost(
  capacityTiB: number,
  ratePerGbMonth: number,
  termMonths: number,
): number {
  return capacityTiB * TIB_TO_GB * ratePerGbMonth * termMonths;
}

/**
 * Write ops cost.
 * Number of ops = capacityTiB × TIB_TO_MB / OPERATION_SIZE_MB
 * Each batch of opsBatchSize ops costs opsCost dollars.
 *
 * @param termMonths - Uses months (not years) to match the monthly storage billing cycle.
 */
export function calculateWriteOpsCost(
  capacityTiB: number,
  opsCost: number,
  opsBatchSize: number,
  termMonths: number,
): number {
  const opsPerMonth = (capacityTiB * TIB_TO_MB) / OPERATION_SIZE_MB;
  return opsPerMonth * (opsCost / opsBatchSize) * termMonths;
}

/**
 * Read ops cost.
 * Assumes readFactor of stored data is read back per year (defaults to ANNUAL_READ_FACTOR).
 *
 * @param termYears - Uses years (not months) because the restore factor is an annual rate.
 *   This is intentionally different from calculateWriteOpsCost which uses termMonths.
 */
export function calculateReadOpsCost(
  capacityTiB: number,
  opsCost: number,
  opsBatchSize: number,
  termYears: number,
  readFactor: number = ANNUAL_READ_FACTOR,
): number {
  const opsPerYear = (capacityTiB * TIB_TO_MB * readFactor) / OPERATION_SIZE_MB;
  return opsPerYear * (opsCost / opsBatchSize) * termYears;
}

/**
 * Data retrieval cost.
 * Assumes readFactor of stored data is retrieved per year (defaults to ANNUAL_READ_FACTOR).
 */
export function calculateRetrievalCost(
  capacityTiB: number,
  ratePerGb: number,
  termYears: number,
  readFactor: number = ANNUAL_READ_FACTOR,
): number {
  return capacityTiB * TIB_TO_GB * readFactor * ratePerGb * termYears;
}

/**
 * Internet egress cost.
 * Assumes egressFactor of stored data is egressed per year (defaults to ANNUAL_EGRESS_FACTOR).
 */
export function calculateEgressCost(
  capacityTiB: number,
  ratePerGb: number,
  termYears: number,
  egressFactor: number = ANNUAL_EGRESS_FACTOR,
): number {
  return capacityTiB * TIB_TO_GB * egressFactor * ratePerGb * termYears;
}

interface DiyCostOptions {
  excludeEgress?: boolean;
  /** Annual restore percentage (0–100). Defaults to 20. Drives read ops, retrieval, and egress. */
  restorePercentage?: number;
}

/** Compute all DIY cost components and their total. */
export function calculateDiyCost(
  capacityTiB: number,
  termYears: number,
  pricing: CloudStoragePricing,
  options: DiyCostOptions = {},
): CostBreakdown {
  const { excludeEgress = false, restorePercentage = 20 } = options;
  const restoreFactor = restorePercentage / 100;
  const termMonths = termYears * MONTHS_PER_YEAR;

  const storage = calculateStorageCost(
    capacityTiB,
    pricing.storagePerGbMonth,
    termMonths,
  );
  const writeOps = calculateWriteOpsCost(
    capacityTiB,
    pricing.writeOpsCost,
    pricing.opsBatchSize,
    termMonths,
  );
  const readOps = calculateReadOpsCost(
    capacityTiB,
    pricing.readOpsCost,
    pricing.opsBatchSize,
    termYears,
    restoreFactor,
  );
  const dataRetrieval = calculateRetrievalCost(
    capacityTiB,
    pricing.retrievalPerGb,
    termYears,
    restoreFactor,
  );
  const internetEgress = excludeEgress
    ? 0
    : calculateEgressCost(
        capacityTiB,
        pricing.egressPerGb,
        termYears,
        restoreFactor,
      );

  const total = storage + writeOps + readOps + dataRetrieval + internetEgress;

  return { storage, writeOps, readOps, dataRetrieval, internetEgress, total };
}

/**
 * Calculate the overage cost for Vault Foundation when the restore percentage
 * exceeds the 20% included in the flat fee.
 *
 * Only the incremental fraction above 20% is charged, using option2 cloud
 * pricing (S3 IA for AWS, Blob LRS for Azure).
 *
 * Returns 0 when restorePercentage ≤ 20.
 */
export function calculateVaultFoundationOverage(
  capacityTiB: number,
  termYears: number,
  restorePercentage: number,
  overagePricing: CloudStoragePricing,
  excludeEgress: boolean,
): number {
  const INCLUDED_RESTORE_FRACTION = 0.2;
  const incrementalFactor = Math.max(
    0,
    restorePercentage / 100 - INCLUDED_RESTORE_FRACTION,
  );

  if (incrementalFactor === 0) {
    return 0;
  }

  const readOps = calculateReadOpsCost(
    capacityTiB,
    overagePricing.readOpsCost,
    overagePricing.opsBatchSize,
    termYears,
    incrementalFactor,
  );
  const dataRetrieval = calculateRetrievalCost(
    capacityTiB,
    overagePricing.retrievalPerGb,
    termYears,
    incrementalFactor,
  );
  const internetEgress = excludeEgress
    ? 0
    : calculateEgressCost(
        capacityTiB,
        overagePricing.egressPerGb,
        termYears,
        incrementalFactor,
      );

  return readOps + dataRetrieval + internetEgress;
}
