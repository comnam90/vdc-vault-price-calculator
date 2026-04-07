import type { CloudStoragePricing, RegionCloudPricing } from "@/types/pricing";
import type { CloudProvider } from "@/types/region";

/**
 * Static cloud storage pricing data keyed by VDC API region ID.
 * Source: Published Azure Blob Storage and AWS S3 list prices (approximate).
 * Last updated: 2026-04-07
 *
 * DISCLAIMER: This is unofficial. Prices are approximate public list prices
 * and do not account for discounts, reserved capacity, or negotiated rates.
 */

type RegionPricingPreset = Omit<RegionCloudPricing, "regionId">;

type ProviderPricingSeed = {
  option1: CloudStoragePricing;
  option2: CloudStoragePricing;
  option1Label: string;
  option2Label: string;
};

const roundPrice = (value: number) => Number(value.toFixed(6));

function scalePricing(
  base: CloudStoragePricing,
  multiplier: number,
  egressPerGb: number,
): CloudStoragePricing {
  return {
    storagePerGbMonth: roundPrice(base.storagePerGbMonth * multiplier),
    writeOpsCost: roundPrice(base.writeOpsCost * multiplier),
    readOpsCost: roundPrice(base.readOpsCost * multiplier),
    opsBatchSize: base.opsBatchSize,
    retrievalPerGb: roundPrice(base.retrievalPerGb * multiplier),
    egressPerGb: roundPrice(egressPerGb),
  };
}

function makePreset(
  provider: CloudProvider,
  seed: ProviderPricingSeed,
  multiplier: number,
  egressPerGb: number,
): RegionPricingPreset {
  return {
    provider,
    option1Label: seed.option1Label,
    option2Label: seed.option2Label,
    option1: scalePricing(seed.option1, multiplier, egressPerGb),
    option2: scalePricing(seed.option2, multiplier, egressPerGb),
  };
}

function makeRegionPricing(
  regionId: string,
  preset: RegionPricingPreset,
): RegionCloudPricing {
  return {
    regionId,
    provider: preset.provider,
    option1Label: preset.option1Label,
    option2Label: preset.option2Label,
    option1: preset.option1,
    option2: preset.option2,
  };
}

const AWS_SEED: ProviderPricingSeed = {
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

const AZURE_SEED: ProviderPricingSeed = {
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.0208,
    writeOpsCost: 0.055,
    readOpsCost: 0.0044,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.087,
  },
  option2: {
    storagePerGbMonth: 0.0115,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.087,
  },
};

const AWS_PRESETS = {
  us: makePreset("AWS", AWS_SEED, 1, 0.09),
  canada: makePreset("AWS", AWS_SEED, 1.043, 0.092),
  europe: makePreset("AWS", AWS_SEED, 1.065, 0.094),
  europePremium: makePreset("AWS", AWS_SEED, 1.11, 0.096),
  israel: makePreset("AWS", AWS_SEED, 1.19, 0.102),
  apac: makePreset("AWS", AWS_SEED, 1.13, 0.099),
  apacPremium: makePreset("AWS", AWS_SEED, 1.22, 0.108),
  middleEast: makePreset("AWS", AWS_SEED, 1.24, 0.11),
  africa: makePreset("AWS", AWS_SEED, 1.25, 0.112),
  southAmerica: makePreset("AWS", AWS_SEED, 1.26, 0.114),
} as const;

const AZURE_PRESETS = {
  us: makePreset("Azure", AZURE_SEED, 1, 0.087),
  usWest: makePreset("Azure", AZURE_SEED, 1.02, 0.087),
  canada: makePreset("Azure", AZURE_SEED, 1.05, 0.089),
  australia: makePreset("Azure", AZURE_SEED, 1.12, 0.094),
  europe: makePreset("Azure", AZURE_SEED, 1.08, 0.09),
  europePremium: makePreset("Azure", AZURE_SEED, 1.12, 0.093),
  japanKorea: makePreset("Azure", AZURE_SEED, 1.12, 0.095),
  india: makePreset("Azure", AZURE_SEED, 1.15, 0.095),
  southeastAsia: makePreset("Azure", AZURE_SEED, 1.14, 0.095),
  eastAsia: makePreset("Azure", AZURE_SEED, 1.2, 0.098),
  apacNew: makePreset("Azure", AZURE_SEED, 1.18, 0.097),
  middleEast: makePreset("Azure", AZURE_SEED, 1.22, 0.1),
  africa: makePreset("Azure", AZURE_SEED, 1.24, 0.101),
  southAmerica: makePreset("Azure", AZURE_SEED, 1.25, 0.102),
} as const;

const entries: [string, RegionCloudPricing][] = [];

function addRegions(
  regionIds: readonly string[],
  preset: RegionPricingPreset,
): void {
  regionIds.forEach((regionId) => {
    entries.push([regionId, makeRegionPricing(regionId, preset)]);
  });
}

addRegions(["aws-us-east-1", "aws-us-east-2", "aws-us-west-2"], AWS_PRESETS.us);
addRegions(["aws-ca-central-1"], AWS_PRESETS.canada);
addRegions(
  ["aws-eu-central-1", "aws-eu-north-1", "aws-eu-west-2", "aws-eu-west-3"],
  AWS_PRESETS.europe,
);
addRegions(
  ["aws-eu-central-2", "aws-eu-south-1", "aws-eu-south-2"],
  AWS_PRESETS.europePremium,
);
addRegions(["aws-il-central-1"], AWS_PRESETS.israel);
addRegions(
  [
    "aws-ap-northeast-1",
    "aws-ap-northeast-2",
    "aws-ap-northeast-3",
    "aws-ap-south-1",
    "aws-ap-southeast-1",
    "aws-ap-southeast-2",
  ],
  AWS_PRESETS.apac,
);
addRegions(
  [
    "aws-ap-east-1",
    "aws-ap-east-2",
    "aws-ap-south-2",
    "aws-ap-southeast-3",
    "aws-ap-southeast-5",
    "aws-ap-southeast-7",
  ],
  AWS_PRESETS.apacPremium,
);
addRegions(["aws-me-central-1"], AWS_PRESETS.middleEast);
addRegions(["aws-af-south-1"], AWS_PRESETS.africa);
addRegions(["aws-sa-east-1"], AWS_PRESETS.southAmerica);

addRegions(
  [
    "azure-us-central",
    "azure-us-east",
    "azure-us-east2",
    "azure-us-north-central",
    "azure-us-south-central",
    "azure-us-west2",
  ],
  AZURE_PRESETS.us,
);
addRegions(["azure-us-west"], AZURE_PRESETS.usWest);
addRegions(["azure-canada-central", "azure-canada-east"], AZURE_PRESETS.canada);
addRegions(
  ["azure-au-east", "azure-australia-southeast"],
  AZURE_PRESETS.australia,
);
addRegions(
  [
    "azure-france-central",
    "azure-germany-west-central",
    "azure-north-europe",
    "azure-sweden-central",
    "azure-uk-south",
    "azure-west-europe",
  ],
  AZURE_PRESETS.europe,
);
addRegions(
  ["azure-austria-east", "azure-italy-north", "azure-switzerland-north"],
  AZURE_PRESETS.europePremium,
);
addRegions(
  ["azure-japan-east", "azure-japan-west", "azure-korea-central"],
  AZURE_PRESETS.japanKorea,
);
addRegions(["azure-india-central", "azure-south-india"], AZURE_PRESETS.india);
addRegions(["azure-southeast-asia"], AZURE_PRESETS.southeastAsia);
addRegions(["azure-east-asia"], AZURE_PRESETS.eastAsia);
addRegions(
  ["azure-indonesia-central", "azure-malaysia-west", "azure-nz-north"],
  AZURE_PRESETS.apacNew,
);
addRegions(
  ["azure-israel-central", "azure-uae-north"],
  AZURE_PRESETS.middleEast,
);
addRegions(
  ["azure-south-africa-north", "azure-south-africa-west"],
  AZURE_PRESETS.africa,
);
addRegions(["azure-brazil-south"], AZURE_PRESETS.southAmerica);

export const CLOUD_PRICING: Record<string, RegionCloudPricing> =
  Object.fromEntries(entries);
