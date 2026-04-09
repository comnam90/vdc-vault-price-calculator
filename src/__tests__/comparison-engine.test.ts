import { describe, expect, it } from "vitest";
import { buildComparison } from "@/lib/comparison-engine";
import type { CalculatorInputs } from "@/types/calculator";
import type { Region } from "@/types/region";
import type { RegionCloudPricing } from "@/types/pricing";

const awsStandardPricing: RegionCloudPricing = {
  regionId: "aws-us-east-1",
  provider: "AWS",
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.023,
    writeOpsCost: 0.005,
    readOpsCost: 0.0004,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.09,
  },
  option2: {
    storagePerGbMonth: 0.0125,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.09,
  },
};

const coreRegion: Region = {
  id: "aws-us-east-1",
  name: "US East (N. Virginia)",
  provider: "AWS",
  coords: [37.9, -77.5],
  aliases: [],
  services: {
    vdc_vault: [
      { edition: "Foundation", tier: "Core" },
      { edition: "Advanced", tier: "Core" },
    ],
  },
};

const nonCoreRegion: Region = {
  id: "aws-ap-east-1",
  name: "Asia Pacific (Hong Kong)",
  provider: "AWS",
  coords: [22.3, 114.1],
  aliases: [],
  services: {
    vdc_vault: [
      { edition: "Foundation", tier: "Non-Core" },
      { edition: "Advanced", tier: "Non-Core" },
    ],
  },
};

const azureNonCorePricing: RegionCloudPricing = {
  regionId: "azure-eastasia",
  provider: "Azure",
  option1Label: "Cool Blob ZRS",
  option2Label: "Cool Blob LRS",
  option1: {
    storagePerGbMonth: 0.02,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.08,
  },
  option2: {
    storagePerGbMonth: 0.015,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.08,
  },
};

const azureNonCoreRegion: Region = {
  id: "azure-eastasia",
  name: "East Asia (Hong Kong)",
  provider: "Azure",
  coords: [22.3, 114.2],
  aliases: [],
  services: {
    vdc_vault: [
      { edition: "Foundation", tier: "Non-Core" },
      { edition: "Advanced", tier: "Non-Core" },
    ],
  },
};

const advancedOnlyRegion: Region = {
  id: "aws-il-central-1",
  name: "Israel (Tel Aviv)",
  provider: "AWS",
  coords: [32.1, 34.8],
  aliases: [],
  services: {
    vdc_vault: [{ edition: "Advanced", tier: "Core" }],
  },
};

describe("buildComparison", () => {
  describe("Core region with Foundation and Advanced available", () => {
    const inputs: CalculatorInputs = {
      regionId: "aws-us-east-1",
      termYears: 3,
      capacityTiB: 10,
    };

    it("returns Foundation total of 5040", () => {
      const result = buildComparison(inputs, coreRegion, awsStandardPricing);
      expect(result.vaultFoundation.total).toBe(5040);
      expect(result.vaultFoundation.pricingTbd).toBe(false);
    });

    it("returns Advanced total of 8640", () => {
      const result = buildComparison(inputs, coreRegion, awsStandardPricing);
      expect(result.vaultAdvanced.total).toBe(8640);
      expect(result.vaultAdvanced.pricingTbd).toBe(false);
    });

    it("returns positive DIY totals for both options", () => {
      const result = buildComparison(inputs, coreRegion, awsStandardPricing);
      expect(result.diyOption1.total).toBeGreaterThan(0);
      expect(result.diyOption2.total).toBeGreaterThan(0);
    });

    it("copies option labels from cloudPricing", () => {
      const result = buildComparison(inputs, coreRegion, awsStandardPricing);
      expect(result.diyOption1Label).toBe("S3 Standard");
      expect(result.diyOption2Label).toBe("S3 Infrequent Access");
    });
  });

  describe("AWS Non-Core region", () => {
    const inputs: CalculatorInputs = {
      regionId: "aws-ap-east-1",
      termYears: 3,
      capacityTiB: 10,
    };

    it("returns Foundation total of 6840 (AWS $19/TB)", () => {
      const result = buildComparison(inputs, nonCoreRegion, awsStandardPricing);
      expect(result.vaultFoundation.total).toBe(6840); // 10 * 19 * 36
      expect(result.vaultFoundation.perTbMonth).toBe(19);
      expect(result.vaultFoundation.pricingTbd).toBe(false);
    });

    it("returns pricingTbd true for Advanced (AWS Advanced Non-Core still TBD)", () => {
      const result = buildComparison(inputs, nonCoreRegion, awsStandardPricing);
      expect(result.vaultAdvanced.total).toBeNull();
      expect(result.vaultAdvanced.pricingTbd).toBe(true);
    });

    it("still computes DIY totals for an AWS Non-Core region", () => {
      const result = buildComparison(inputs, nonCoreRegion, awsStandardPricing);
      expect(result.diyOption1.total).toBeGreaterThan(0);
      expect(result.diyOption2.total).toBeGreaterThan(0);
    });
  });

  describe("Azure Non-Core region", () => {
    const inputs: CalculatorInputs = {
      regionId: "azure-eastasia",
      termYears: 3,
      capacityTiB: 10,
    };

    it("returns Foundation total of 8640 (Azure $24/TB)", () => {
      const result = buildComparison(
        inputs,
        azureNonCoreRegion,
        azureNonCorePricing,
      );
      expect(result.vaultFoundation.total).toBe(8640); // 10 * 24 * 36
      expect(result.vaultFoundation.perTbMonth).toBe(24);
      expect(result.vaultFoundation.pricingTbd).toBe(false);
    });

    it("returns Advanced total of 14400 (Azure $40/TB)", () => {
      const result = buildComparison(
        inputs,
        azureNonCoreRegion,
        azureNonCorePricing,
      );
      expect(result.vaultAdvanced.total).toBe(14400); // 10 * 40 * 36
      expect(result.vaultAdvanced.perTbMonth).toBe(40);
      expect(result.vaultAdvanced.pricingTbd).toBe(false);
    });
  });

  describe("Azure region with ZRS unavailable", () => {
    const azureUnavailablePricing: RegionCloudPricing = {
      ...awsStandardPricing,
      regionId: "azure-us-west",
      provider: "Azure",
      option1Label: "Cool Blob ZRS",
      option2Label: "Cool Blob LRS",
      option1Unavailable: true,
    };

    const inputs: CalculatorInputs = {
      regionId: "azure-us-west",
      termYears: 3,
      capacityTiB: 10,
    };

    it("sets diyOption1Unavailable to true", () => {
      const result = buildComparison(
        inputs,
        coreRegion,
        azureUnavailablePricing,
      );
      expect(result.diyOption1Unavailable).toBe(true);
    });

    it("returns zero diyOption1 total when unavailable", () => {
      const result = buildComparison(
        inputs,
        coreRegion,
        azureUnavailablePricing,
      );
      expect(result.diyOption1.total).toBe(0);
    });

    it("still computes diyOption2 normally when option1 unavailable", () => {
      const result = buildComparison(
        inputs,
        coreRegion,
        azureUnavailablePricing,
      );
      expect(result.diyOption2.total).toBeGreaterThan(0);
    });

    it("does not set diyOption1Unavailable for normal pricing", () => {
      const result = buildComparison(inputs, coreRegion, awsStandardPricing);
      expect(result.diyOption1Unavailable).toBeUndefined();
    });
  });

  describe("Advanced-only region", () => {
    const inputs: CalculatorInputs = {
      regionId: "aws-il-central-1",
      termYears: 1,
      capacityTiB: 10,
    };

    it("returns null for Foundation (not pricingTbd)", () => {
      const result = buildComparison(
        inputs,
        advancedOnlyRegion,
        awsStandardPricing,
      );
      expect(result.vaultFoundation.total).toBeNull();
      expect(result.vaultFoundation.pricingTbd).toBe(false);
    });

    it("returns Advanced total of 2880", () => {
      const result = buildComparison(
        inputs,
        advancedOnlyRegion,
        awsStandardPricing,
      );
      expect(result.vaultAdvanced.total).toBe(2880);
    });
  });
});
