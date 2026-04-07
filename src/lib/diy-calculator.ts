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
 * Assumes ANNUAL_READ_FACTOR of stored data is read back per year.
 */
export function calculateReadOpsCost(
  capacityTiB: number,
  opsCost: number,
  opsBatchSize: number,
  termYears: number,
): number {
  const opsPerYear =
    (capacityTiB * TIB_TO_MB * ANNUAL_READ_FACTOR) / OPERATION_SIZE_MB;
  return opsPerYear * (opsCost / opsBatchSize) * termYears;
}

/**
 * Data retrieval cost.
 * Assumes ANNUAL_READ_FACTOR of stored data is retrieved per year.
 */
export function calculateRetrievalCost(
  capacityTiB: number,
  ratePerGb: number,
  termYears: number,
): number {
  return capacityTiB * TIB_TO_GB * ANNUAL_READ_FACTOR * ratePerGb * termYears;
}

/**
 * Internet egress cost.
 * Assumes ANNUAL_EGRESS_FACTOR of stored data is egressed per year.
 */
export function calculateEgressCost(
  capacityTiB: number,
  ratePerGb: number,
  termYears: number,
): number {
  return capacityTiB * TIB_TO_GB * ANNUAL_EGRESS_FACTOR * ratePerGb * termYears;
}

/** Compute all DIY cost components and their total. */
export function calculateDiyCost(
  capacityTiB: number,
  termYears: number,
  pricing: CloudStoragePricing,
): CostBreakdown {
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
  );
  const dataRetrieval = calculateRetrievalCost(
    capacityTiB,
    pricing.retrievalPerGb,
    termYears,
  );
  const internetEgress = calculateEgressCost(
    capacityTiB,
    pricing.egressPerGb,
    termYears,
  );

  const total = storage + writeOps + readOps + dataRetrieval + internetEgress;

  return { storage, writeOps, readOps, dataRetrieval, internetEgress, total };
}
