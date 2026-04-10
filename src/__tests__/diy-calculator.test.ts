import { describe, expect, it } from "vitest";
import {
  calculateStorageCost,
  calculateWriteOpsCost,
  calculateReadOpsCost,
  calculateRetrievalCost,
  calculateEgressCost,
  calculateDiyCost,
  calculateVaultFoundationOverage,
} from "@/lib/diy-calculator";
import { ANNUAL_READ_FACTOR, ANNUAL_EGRESS_FACTOR } from "@/lib/constants";
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

describe("calculateReadOpsCost with custom readFactor", () => {
  it("behaves identically to default when readFactor equals ANNUAL_READ_FACTOR", () => {
    const default_ = calculateReadOpsCost(10, 0.0004, 1000, 3);
    const explicit = calculateReadOpsCost(
      10,
      0.0004,
      1000,
      3,
      ANNUAL_READ_FACTOR,
    );
    expect(explicit).toBeCloseTo(default_, 10);
  });

  it("scales result when readFactor is 0.5 (2.5× the default 0.2)", () => {
    const default_ = calculateReadOpsCost(10, 0.0004, 1000, 3);
    const custom = calculateReadOpsCost(10, 0.0004, 1000, 3, 0.5);
    expect(custom).toBeCloseTo(default_ * 2.5, 4);
  });

  it("returns 0 when readFactor is 0", () => {
    expect(calculateReadOpsCost(10, 0.0004, 1000, 3, 0)).toBe(0);
  });
});

describe("calculateRetrievalCost with custom readFactor", () => {
  it("behaves identically to default when readFactor equals ANNUAL_READ_FACTOR", () => {
    const default_ = calculateRetrievalCost(10, 0.01, 3);
    const explicit = calculateRetrievalCost(10, 0.01, 3, ANNUAL_READ_FACTOR);
    expect(explicit).toBeCloseTo(default_, 10);
  });

  it("scales result when readFactor is 0.5", () => {
    const default_ = calculateRetrievalCost(10, 0.01, 3);
    const custom = calculateRetrievalCost(10, 0.01, 3, 0.5);
    expect(custom).toBeCloseTo(default_ * 2.5, 4);
  });

  it("returns 0 when readFactor is 0", () => {
    expect(calculateRetrievalCost(10, 0.01, 3, 0)).toBe(0);
  });
});

describe("calculateEgressCost with custom egressFactor", () => {
  it("behaves identically to default when egressFactor equals ANNUAL_EGRESS_FACTOR", () => {
    const default_ = calculateEgressCost(10, 0.09, 3);
    const explicit = calculateEgressCost(10, 0.09, 3, ANNUAL_EGRESS_FACTOR);
    expect(explicit).toBeCloseTo(default_, 10);
  });

  it("scales result when egressFactor is 0.5", () => {
    const default_ = calculateEgressCost(10, 0.09, 3);
    const custom = calculateEgressCost(10, 0.09, 3, 0.5);
    expect(custom).toBeCloseTo(default_ * 2.5, 4);
  });

  it("returns 0 when egressFactor is 0", () => {
    expect(calculateEgressCost(10, 0, 3, 0)).toBe(0);
  });
});

describe("calculateDiyCost with restorePercentage option", () => {
  const pricing: CloudStoragePricing = {
    storagePerGbMonth: 0.023,
    writeOpsCost: 0.005,
    readOpsCost: 0.0004,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.09,
  };

  it("readOps scales with restorePercentage", () => {
    const at20 = calculateDiyCost(10, 3, pricing, { restorePercentage: 20 });
    const at40 = calculateDiyCost(10, 3, pricing, { restorePercentage: 40 });
    expect(at40.readOps).toBeCloseTo(at20.readOps * 2, 4);
  });

  it("dataRetrieval scales with restorePercentage", () => {
    const at20 = calculateDiyCost(10, 3, pricing, { restorePercentage: 20 });
    const at40 = calculateDiyCost(10, 3, pricing, { restorePercentage: 40 });
    expect(at40.dataRetrieval).toBeCloseTo(at20.dataRetrieval * 2, 4);
  });

  it("internetEgress scales with restorePercentage", () => {
    const at20 = calculateDiyCost(10, 3, pricing, { restorePercentage: 20 });
    const at40 = calculateDiyCost(10, 3, pricing, { restorePercentage: 40 });
    expect(at40.internetEgress).toBeCloseTo(at20.internetEgress * 2, 4);
  });

  it("storage and writeOps are unaffected by restorePercentage", () => {
    const at20 = calculateDiyCost(10, 3, pricing, { restorePercentage: 20 });
    const at40 = calculateDiyCost(10, 3, pricing, { restorePercentage: 40 });
    expect(at40.storage).toBeCloseTo(at20.storage, 10);
    expect(at40.writeOps).toBeCloseTo(at20.writeOps, 10);
  });

  it("behaves identically to default (20%) when restorePercentage is omitted", () => {
    const omitted = calculateDiyCost(10, 3, pricing);
    const explicit = calculateDiyCost(10, 3, pricing, {
      restorePercentage: 20,
    });
    expect(omitted.total).toBeCloseTo(explicit.total, 10);
  });

  it("all costs are zero when restorePercentage is 0 except storage and writeOps", () => {
    const result = calculateDiyCost(10, 3, pricing, { restorePercentage: 0 });
    expect(result.readOps).toBe(0);
    expect(result.dataRetrieval).toBe(0);
    expect(result.internetEgress).toBe(0);
    expect(result.storage).toBeGreaterThan(0);
    expect(result.writeOps).toBeGreaterThan(0);
  });
});

describe("calculateVaultFoundationOverage", () => {
  const iaLikePricing: CloudStoragePricing = {
    storagePerGbMonth: 0.0125,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.085,
  };

  it("returns 0 when restorePercentage is exactly 20", () => {
    expect(
      calculateVaultFoundationOverage(10, 3, 20, iaLikePricing, false),
    ).toBe(0);
  });

  it("returns 0 when restorePercentage is below 20", () => {
    expect(
      calculateVaultFoundationOverage(10, 3, 10, iaLikePricing, false),
    ).toBe(0);
  });

  it("returns 0 when restorePercentage is 0", () => {
    expect(
      calculateVaultFoundationOverage(10, 3, 0, iaLikePricing, false),
    ).toBe(0);
  });

  it("charges only the incremental fraction above 20%", () => {
    // restore=40% → incremental factor = 0.20 (same as the base 20%)
    // so overage should equal a full base-20% cost (readOps + retrieval + egress)
    const overage = calculateVaultFoundationOverage(
      10,
      3,
      40,
      iaLikePricing,
      false,
    );
    const baseReadOps = calculateReadOpsCost(
      10,
      iaLikePricing.readOpsCost,
      iaLikePricing.opsBatchSize,
      3,
      0.2,
    );
    const baseRetrieval = calculateRetrievalCost(
      10,
      iaLikePricing.retrievalPerGb,
      3,
      0.2,
    );
    const baseEgress = calculateEgressCost(
      10,
      iaLikePricing.egressPerGb,
      3,
      0.2,
    );
    expect(overage).toBeCloseTo(baseReadOps + baseRetrieval + baseEgress, 4);
  });

  it("suppresses egress when excludeEgress is true", () => {
    const withEgress = calculateVaultFoundationOverage(
      10,
      3,
      50,
      iaLikePricing,
      false,
    );
    const withoutEgress = calculateVaultFoundationOverage(
      10,
      3,
      50,
      iaLikePricing,
      true,
    );
    expect(withoutEgress).toBeLessThan(withEgress);
    // The difference should equal the egress portion
    const egressPortion = calculateEgressCost(
      10,
      iaLikePricing.egressPerGb,
      3,
      0.3,
    );
    expect(withEgress - withoutEgress).toBeCloseTo(egressPortion, 4);
  });

  it("scales linearly with termYears", () => {
    const threeYear = calculateVaultFoundationOverage(
      10,
      3,
      50,
      iaLikePricing,
      false,
    );
    const oneYear = calculateVaultFoundationOverage(
      10,
      1,
      50,
      iaLikePricing,
      false,
    );
    expect(threeYear).toBeCloseTo(oneYear * 3, 4);
  });

  it("scales linearly with capacityTiB", () => {
    const ten = calculateVaultFoundationOverage(
      10,
      3,
      50,
      iaLikePricing,
      false,
    );
    const twenty = calculateVaultFoundationOverage(
      20,
      3,
      50,
      iaLikePricing,
      false,
    );
    expect(twenty).toBeCloseTo(ten * 2, 4);
  });

  it("returns 0 when retrievalPerGb is 0 and excludeEgress is true (read ops only)", () => {
    const standardPricing: CloudStoragePricing = {
      ...iaLikePricing,
      retrievalPerGb: 0,
    };
    const overage = calculateVaultFoundationOverage(
      10,
      3,
      50,
      standardPricing,
      true,
    );
    // Only read ops contribute
    const expectedReadOps = calculateReadOpsCost(
      10,
      standardPricing.readOpsCost,
      standardPricing.opsBatchSize,
      3,
      0.3,
    );
    expect(overage).toBeCloseTo(expectedReadOps, 4);
  });
});
