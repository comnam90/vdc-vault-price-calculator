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

  it("option1 storage rate >= option2 storage rate (ZRS/standard costs more)", () => {
    for (const [, pricing] of entries) {
      if (pricing.option1Unavailable) continue;
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
    // Source: https://aws.amazon.com/s3/pricing/ (50 TB–500 TB/month tier)
    expect(CLOUD_PRICING["aws-us-east-1"].option1.storagePerGbMonth).toBe(
      0.022,
    );
    expect(CLOUD_PRICING["aws-ap-southeast-2"].option1.storagePerGbMonth).toBe(
      0.024,
    );
    expect(CLOUD_PRICING["aws-eu-west-2"].option1.storagePerGbMonth).toBe(
      0.023,
    );
    expect(CLOUD_PRICING["aws-ap-northeast-1"].option1.storagePerGbMonth).toBe(
      0.024,
    );
  });

  it("preserves exact published decimals for AWS premium-region storage", () => {
    // Source: AWS public S3 offer data (50 TB–500 TB/month tier and Standard-IA)
    expect(CLOUD_PRICING["aws-eu-central-2"].option1.storagePerGbMonth).toBe(
      0.02585,
    );
    expect(CLOUD_PRICING["aws-eu-central-2"].option2.storagePerGbMonth).toBe(
      0.01485,
    );
    expect(CLOUD_PRICING["aws-ap-southeast-5"].option2.storagePerGbMonth).toBe(
      0.01242,
    );
    expect(CLOUD_PRICING["aws-ap-southeast-7"].option2.storagePerGbMonth).toBe(
      0.01242,
    );
  });

  it("spot-checks AWS and Azure egress prices match published list prices", () => {
    // Source: https://aws.amazon.com/s3/pricing/ (10 TB–50 TB/month tier)
    expect(CLOUD_PRICING["aws-us-east-1"].option1.egressPerGb).toBe(0.085);
    expect(CLOUD_PRICING["aws-ap-southeast-2"].option1.egressPerGb).toBe(0.098);
    // Source: https://azure.microsoft.com/en-us/pricing/details/bandwidth/
    expect(CLOUD_PRICING["azure-us-east"].option1.egressPerGb).toBe(0.087);
    expect(CLOUD_PRICING["azure-west-europe"].option1.egressPerGb).toBe(0.087);
  });

  it("spot-checks Azure Cool ZRS storage prices match Azure Retail API values", () => {
    // Source: https://prices.azure.com/api/retail/prices (Cool ZRS, General Block Blob v2)
    expect(CLOUD_PRICING["azure-us-east"].option1.storagePerGbMonth).toBe(
      0.019,
    );
    expect(CLOUD_PRICING["azure-west-europe"].option1.storagePerGbMonth).toBe(
      0.0131,
    );
    expect(CLOUD_PRICING["azure-us-east2"].option1.storagePerGbMonth).toBe(
      0.0125,
    );
    expect(CLOUD_PRICING["azure-brazil-south"].option1.storagePerGbMonth).toBe(
      0.0221,
    );
    // France Central and UK South share the same LRS price but have distinct ZRS prices
    expect(
      CLOUD_PRICING["azure-france-central"].option1.storagePerGbMonth,
    ).toBe(0.0131);
    expect(CLOUD_PRICING["azure-uk-south"].option1.storagePerGbMonth).toBe(
      0.013125,
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

  it("AWS S3 Standard (option1) has no retrieval fee", () => {
    for (const [, pricing] of entries) {
      if (pricing.provider === "AWS") {
        expect(pricing.option1.retrievalPerGb).toBe(0);
      }
    }
  });

  it("option2 always has a retrieval fee", () => {
    for (const [, pricing] of entries) {
      expect(pricing.option2.retrievalPerGb).toBeGreaterThan(0);
    }
  });

  it("Azure regions use Cool Blob ZRS / Cool Blob LRS labels", () => {
    for (const [, pricing] of entries) {
      if (pricing.provider === "Azure") {
        expect(pricing.option1Label).toBe("Cool Blob ZRS");
        expect(pricing.option2Label).toBe("Cool Blob LRS");
      }
    }
  });

  it("ZRS-unavailable Azure regions are flagged and ZRS-available ones are not", () => {
    const unavailableIds = [
      "azure-us-north-central",
      "azure-us-west",
      "azure-canada-east",
      "azure-australia-southeast",
      "azure-south-india",
      "azure-south-africa-west",
    ];

    for (const id of unavailableIds) {
      expect(CLOUD_PRICING[id].option1Unavailable).toBe(true);
    }

    const availableAzureIds = Object.keys(CLOUD_PRICING).filter(
      (id) =>
        CLOUD_PRICING[id].provider === "Azure" && !unavailableIds.includes(id),
    );

    for (const id of availableAzureIds) {
      expect(CLOUD_PRICING[id].option1Unavailable).toBeUndefined();
    }
  });
});
