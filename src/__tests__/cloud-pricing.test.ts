import { describe, it, expect } from "vitest";
import { CLOUD_PRICING } from "@/data/cloud-pricing";

describe("cloud pricing data integrity", () => {
  const entries = Object.entries(CLOUD_PRICING);

  it("has pricing for exactly 62 regions", () => {
    expect(entries.length).toBe(62);
  });

  it("every entry has required fields with valid numbers", () => {
    for (const [regionId, pricing] of entries) {
      expect(pricing.regionId).toBe(regionId);
      for (const option of [pricing.option1, pricing.option2]) {
        expect(option.storagePerGbMonth).toBeGreaterThan(0);
        expect(option.writeOpsCost).toBeGreaterThan(0);
        expect(option.readOpsCost).toBeGreaterThan(0);
        expect(option.opsBatchSize).toBeGreaterThan(0);
        expect(option.retrievalPerGb).toBeGreaterThanOrEqual(0);
        expect(option.egressPerGb).toBeGreaterThan(0);
        expect(Number.isFinite(option.storagePerGbMonth)).toBe(true);
        expect(Number.isFinite(option.writeOpsCost)).toBe(true);
        expect(Number.isFinite(option.readOpsCost)).toBe(true);
        expect(Number.isFinite(option.opsBatchSize)).toBe(true);
        expect(Number.isFinite(option.retrievalPerGb)).toBe(true);
        expect(Number.isFinite(option.egressPerGb)).toBe(true);
      }
    }
  });

  it("option1 storage rate >= option2 storage rate (hot/standard costs more)", () => {
    for (const [, pricing] of entries) {
      expect(pricing.option1.storagePerGbMonth).toBeGreaterThanOrEqual(
        pricing.option2.storagePerGbMonth,
      );
    }
  });

  it("AWS regions use 1000 ops batch size", () => {
    for (const [, pricing] of entries) {
      if (pricing.provider === "AWS") {
        expect(pricing.option1.opsBatchSize).toBe(1000);
        expect(pricing.option2.opsBatchSize).toBe(1000);
      }
    }
  });

  it("Azure regions use 10000 ops batch size", () => {
    for (const [, pricing] of entries) {
      if (pricing.provider === "Azure") {
        expect(pricing.option1.opsBatchSize).toBe(10000);
        expect(pricing.option2.opsBatchSize).toBe(10000);
      }
    }
  });
});
