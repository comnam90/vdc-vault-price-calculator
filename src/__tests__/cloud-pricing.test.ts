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

  it("spot-checks AWS storage prices match published list prices", () => {
    // Source: https://aws.amazon.com/s3/pricing/ (first 50 TB/month tier)
    expect(CLOUD_PRICING["aws-us-east-1"].option1.storagePerGbMonth).toBe(
      0.023,
    );
    expect(CLOUD_PRICING["aws-ap-southeast-2"].option1.storagePerGbMonth).toBe(
      0.025,
    );
    expect(CLOUD_PRICING["aws-eu-west-2"].option1.storagePerGbMonth).toBe(
      0.024,
    );
    expect(CLOUD_PRICING["aws-ap-northeast-1"].option1.storagePerGbMonth).toBe(
      0.025,
    );
  });

  it("spot-checks AWS and Azure egress prices match published list prices", () => {
    // Source: https://aws.amazon.com/s3/pricing/ (first 10 TB/month tier)
    expect(CLOUD_PRICING["aws-us-east-1"].option1.egressPerGb).toBe(0.09);
    expect(CLOUD_PRICING["aws-ap-southeast-2"].option1.egressPerGb).toBe(0.114);
    // Source: https://azure.microsoft.com/en-us/pricing/details/bandwidth/
    expect(CLOUD_PRICING["azure-us-east"].option1.egressPerGb).toBe(0.087);
    expect(CLOUD_PRICING["azure-west-europe"].option1.egressPerGb).toBe(0.087);
  });

  it("spot-checks Azure storage prices match published list prices", () => {
    // Source: https://azure.microsoft.com/en-us/pricing/details/storage/blobs/ (Hot LRS, first tier)
    expect(CLOUD_PRICING["azure-us-east"].option1.storagePerGbMonth).toBe(
      0.0208,
    );
    expect(CLOUD_PRICING["azure-west-europe"].option1.storagePerGbMonth).toBe(
      0.0196,
    );
  });

  it("AWS S3 IA write ops cost is higher than S3 Standard write ops cost", () => {
    for (const [, pricing] of entries) {
      if (pricing.provider === "AWS") {
        expect(pricing.option2.writeOpsCost).toBeGreaterThan(
          pricing.option1.writeOpsCost,
        );
      }
    }
  });

  it("option1 has no retrieval fee and option2 has a retrieval fee", () => {
    for (const [, pricing] of entries) {
      expect(pricing.option1.retrievalPerGb).toBe(0);
      expect(pricing.option2.retrievalPerGb).toBeGreaterThan(0);
    }
  });
});
