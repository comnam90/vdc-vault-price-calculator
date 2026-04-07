import type { ComparisonResult } from "@/types/calculator";

export const FIXTURE_CAPACITY_TIB = 10;
export const FIXTURE_TERM_YEARS = 3;

export const fixtureComparison: ComparisonResult = {
  vaultFoundation: {
    total: 5040,
    perTbMonth: 14,
    pricingTbd: false,
  },
  vaultAdvanced: {
    total: 8640,
    perTbMonth: 24,
    pricingTbd: false,
  },
  diyOption1: {
    storage: 7200,
    writeOps: 900,
    readOps: 300,
    dataRetrieval: 200,
    internetEgress: 400,
    total: 9000,
  },
  diyOption2: {
    storage: 3300,
    writeOps: 350,
    readOps: 150,
    dataRetrieval: 250,
    internetEgress: 450,
    total: 4500,
  },
  diyOption1Label: "S3 Standard",
  diyOption2Label: "S3 Infrequent Access",
};
