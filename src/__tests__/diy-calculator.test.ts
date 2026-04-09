import { describe, expect, it } from "vitest";
import {
  calculateStorageCost,
  calculateWriteOpsCost,
  calculateReadOpsCost,
  calculateRetrievalCost,
  calculateEgressCost,
  calculateDiyCost,
} from "@/lib/diy-calculator";
import type { CloudStoragePricing } from "@/types/pricing";

describe("calculateStorageCost", () => {
  it("computes storage cost for 10 TiB, 36 months at $0.023/GB/month", () => {
    expect(calculateStorageCost(10, 0.023, 36)).toBeCloseTo(8478.72, 4);
  });

  it("returns 0 for a zero rate", () => {
    expect(calculateStorageCost(10, 0, 36)).toBe(0);
  });
});

describe("calculateWriteOpsCost", () => {
  it("computes AWS write ops for 10 TiB, $0.005/1000 ops, 36 months", () => {
    expect(calculateWriteOpsCost(10, 0.005, 1000, 36)).toBeCloseTo(
      1887.4368,
      4,
    );
  });

  it("computes Azure write ops for 10 TiB, $0.055/10000 ops, 36 months", () => {
    expect(calculateWriteOpsCost(10, 0.055, 10000, 36)).toBeCloseTo(
      2076.1805,
      4,
    );
  });
});

describe("calculateReadOpsCost", () => {
  it("computes AWS read ops for 10 TiB, $0.0004/1000 ops, 3 years", () => {
    expect(calculateReadOpsCost(10, 0.0004, 1000, 3)).toBeCloseTo(2.5166, 4);
  });

  it("returns 0 for a zero rate", () => {
    expect(calculateReadOpsCost(10, 0, 1000, 3)).toBe(0);
  });
});

describe("calculateRetrievalCost", () => {
  it("returns 0 when retrieval rate is zero (S3 Standard)", () => {
    expect(calculateRetrievalCost(10, 0, 3)).toBe(0);
  });

  it("computes retrieval for 10 TiB, $0.01/GB, 3 years (S3 IA)", () => {
    expect(calculateRetrievalCost(10, 0.01, 3)).toBeCloseTo(61.44, 4);
  });
});

describe("calculateEgressCost", () => {
  it("computes egress for 10 TiB, $0.09/GB, 3 years", () => {
    expect(calculateEgressCost(10, 0.09, 3)).toBeCloseTo(552.96, 4);
  });

  it("returns 0 when egress rate is zero", () => {
    expect(calculateEgressCost(10, 0, 3)).toBe(0);
  });
});

describe("calculateDiyCost", () => {
  const awsStandardPricing: CloudStoragePricing = {
    storagePerGbMonth: 0.023,
    writeOpsCost: 0.005,
    readOpsCost: 0.0004,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.09,
  };

  it("returns a CostBreakdown with all five components and a total", () => {
    const result = calculateDiyCost(10, 3, awsStandardPricing);
    expect(result).toHaveProperty("storage");
    expect(result).toHaveProperty("writeOps");
    expect(result).toHaveProperty("readOps");
    expect(result).toHaveProperty("dataRetrieval");
    expect(result).toHaveProperty("internetEgress");
    expect(result).toHaveProperty("total");
  });

  it("total equals sum of all five components", () => {
    const result = calculateDiyCost(10, 3, awsStandardPricing);
    const sum =
      result.storage +
      result.writeOps +
      result.readOps +
      result.dataRetrieval +
      result.internetEgress;
    expect(result.total).toBeCloseTo(sum, 10);
  });

  it("all components are positive for standard pricing", () => {
    const result = calculateDiyCost(10, 3, awsStandardPricing);
    expect(result.storage).toBeGreaterThan(0);
    expect(result.writeOps).toBeGreaterThan(0);
    expect(result.readOps).toBeGreaterThan(0);
    expect(result.dataRetrieval).toBeGreaterThanOrEqual(0);
    expect(result.internetEgress).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
  });

  it("returns a positive total under $10,000 for 1 TiB, 1 year", () => {
    const result = calculateDiyCost(1, 1, awsStandardPricing);
    expect(result.total).toBeGreaterThan(0);
    expect(result.total).toBeLessThan(10000);
  });

  it("storage component matches expected value for 10 TiB, 3 years", () => {
    const result = calculateDiyCost(10, 3, awsStandardPricing);
    expect(result.storage).toBeCloseTo(8478.72, 4);
  });
});

describe("calculateDiyCost with excludeEgress option", () => {
  const pricing: CloudStoragePricing = {
    storagePerGbMonth: 0.023,
    writeOpsCost: 0.005,
    readOpsCost: 0.0004,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.09,
  };

  it("returns internetEgress of 0 when excludeEgress is true", () => {
    const result = calculateDiyCost(10, 3, pricing, { excludeEgress: true });
    expect(result.internetEgress).toBe(0);
  });

  it("total excludes egress when excludeEgress is true", () => {
    const withEgress = calculateDiyCost(10, 3, pricing);
    const withoutEgress = calculateDiyCost(10, 3, pricing, {
      excludeEgress: true,
    });
    expect(withoutEgress.total).toBeCloseTo(
      withEgress.total - withEgress.internetEgress,
      10,
    );
  });

  it("total still equals sum of all five components when excludeEgress is true", () => {
    const result = calculateDiyCost(10, 3, pricing, { excludeEgress: true });
    const sum =
      result.storage +
      result.writeOps +
      result.readOps +
      result.dataRetrieval +
      result.internetEgress;
    expect(result.total).toBeCloseTo(sum, 10);
  });

  it("behaves identically to the default when excludeEgress is false", () => {
    const withFlag = calculateDiyCost(10, 3, pricing, { excludeEgress: false });
    const withoutFlag = calculateDiyCost(10, 3, pricing);
    expect(withFlag.internetEgress).toBeCloseTo(withoutFlag.internetEgress, 10);
    expect(withFlag.total).toBeCloseTo(withoutFlag.total, 10);
  });

  it("behaves identically to the default when options are omitted", () => {
    const explicit = calculateDiyCost(10, 3, pricing, {});
    const implicit = calculateDiyCost(10, 3, pricing);
    expect(explicit.total).toBeCloseTo(implicit.total, 10);
  });
});
