import type { CloudProvider } from "@/types/region";
import type { CloudStoragePricing, RegionCloudPricing } from "@/types/pricing";

/**
 * Static cloud storage pricing data keyed by VDC API region ID.
 *
 * Sources (verified 2026-04-08, public list prices — no discounts modeled):
 *   AWS S3 storage, ops, retrieval:
 *     https://aws.amazon.com/s3/pricing/
 *   AWS internet egress:
 *     https://aws.amazon.com/ec2/pricing/on-demand/ (Data Transfer section)
 *   Azure Blob Storage (storage, ops, retrieval):
 *     https://azure.microsoft.com/en-us/pricing/details/storage/blobs/
 *   Azure internet egress:
 *     https://azure.microsoft.com/en-us/pricing/details/bandwidth/
 *
 * Pricing tiers used:
 *   AWS storage  — 50 TB–500 TB/month tier (representative enterprise-scale rate)
 *   AWS egress   — 10 TB–50 TB/month tier (representative enterprise-scale rate)
 *   Azure Blob   — first storage tier (LRS redundancy)
 *   Azure egress — first paid tier (~100 GB threshold, Zone pricing)
 *
 * DISCLAIMER: Prices are approximate and unofficial. No discounts, reserved
 * capacity, negotiated rates, taxes, or commitment pricing are modeled.
 */

/** Local-only type for a group of pricing that can be spread into RegionCloudPricing */
type PricingGroup = {
  provider: CloudProvider;
  option1Label: string;
  option2Label: string;
  option1: CloudStoragePricing;
  option2: CloudStoragePricing;
};

// ─── AWS PRICING GROUPS ───────────────────────────────────────────────────────
//
// option1 = S3 Standard   (opsBatchSize 1000, retrievalPerGb 0)
// option2 = S3 Standard-IA (opsBatchSize 1000, retrievalPerGb 0.01)
//
// AWS S3 IA ops pricing is the same across all regions:
//   write: $0.01/1k PUT  |  read: $0.001/1k GET  |  retrieval: $0.01/GB

/** US East/West (us-east-1, us-east-2, us-west-2) — same as EU Stockholm */
const AWS_US: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.022,
    writeOpsCost: 0.005,
    readOpsCost: 0.0004,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.085,
  },
  option2: {
    storagePerGbMonth: 0.0125,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.085,
  },
};

/** Canada (ca-central-1) */
const AWS_CA: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.024,
    writeOpsCost: 0.0055,
    readOpsCost: 0.00044,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.085,
  },
  option2: {
    storagePerGbMonth: 0.0138,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.085,
  },
};

/** EU Frankfurt (eu-central-1) */
const AWS_EU_DE: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.0235,
    writeOpsCost: 0.0054,
    readOpsCost: 0.00043,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.085,
  },
  option2: {
    storagePerGbMonth: 0.0135,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.085,
  },
};

/** EU London + Paris (eu-west-2, eu-west-3) */
const AWS_EU_GB_FR: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.023,
    writeOpsCost: 0.0053,
    readOpsCost: 0.00042,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.085,
  },
  option2: {
    storagePerGbMonth: 0.0131,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.085,
  },
};

/** EU Zurich (eu-central-2) */
const AWS_EU_ZH: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.02585,
    writeOpsCost: 0.0054,
    readOpsCost: 0.00043,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.085,
  },
  option2: {
    storagePerGbMonth: 0.01485,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.085,
  },
};

/** EU Milan (eu-south-1) */
const AWS_EU_MI: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.023,
    writeOpsCost: 0.0053,
    readOpsCost: 0.0004,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.085,
  },
  option2: {
    storagePerGbMonth: 0.0131,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.085,
  },
};

/** EU Spain (eu-south-2) */
const AWS_EU_ES: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.022,
    writeOpsCost: 0.0053,
    readOpsCost: 0.0004,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.085,
  },
  option2: {
    storagePerGbMonth: 0.0125,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.085,
  },
};

/** Israel Tel Aviv (il-central-1) */
const AWS_IL: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.024,
    writeOpsCost: 0.0055,
    readOpsCost: 0.00044,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.085,
  },
  option2: {
    storagePerGbMonth: 0.0138,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.085,
  },
};

/** AP Tokyo + Osaka (ap-northeast-1, ap-northeast-3) */
const AWS_AP_JP: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.024,
    writeOpsCost: 0.0047,
    readOpsCost: 0.00037,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.089,
  },
  option2: {
    storagePerGbMonth: 0.0138,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.089,
  },
};

/** AP Seoul (ap-northeast-2) */
const AWS_AP_KR: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.024,
    writeOpsCost: 0.0045,
    readOpsCost: 0.00035,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.122,
  },
  option2: {
    storagePerGbMonth: 0.0138,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.122,
  },
};

/** AP Mumbai + Hyderabad (ap-south-1, ap-south-2) */
const AWS_AP_IN: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.024,
    writeOpsCost: 0.005,
    readOpsCost: 0.0004,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.085,
  },
  option2: {
    storagePerGbMonth: 0.0138,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.085,
  },
};

/** AP Singapore + Hong Kong (ap-southeast-1, ap-east-1) */
const AWS_AP_SG: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.024,
    writeOpsCost: 0.005,
    readOpsCost: 0.0004,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.085,
  },
  option2: {
    storagePerGbMonth: 0.0138,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.085,
  },
};

/** AP Sydney (ap-southeast-2) */
const AWS_AP_AU: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.024,
    writeOpsCost: 0.0055,
    readOpsCost: 0.00044,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.098,
  },
  option2: {
    storagePerGbMonth: 0.0138,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.098,
  },
};

/** AP Malaysia (ap-east-2) */
const AWS_AP_MY: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.0216,
    writeOpsCost: 0.00423,
    readOpsCost: 0.000333,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.08455,
  },
  option2: {
    storagePerGbMonth: 0.01242,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.08455,
  },
};

/** AP Jakarta (ap-southeast-3) */
const AWS_AP_JK: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.024,
    writeOpsCost: 0.005,
    readOpsCost: 0.0004,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.1,
  },
  option2: {
    storagePerGbMonth: 0.0138,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.1,
  },
};

/** AP Malaysia + Thailand (ap-southeast-5, ap-southeast-7) */
const AWS_AP_NEW: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.0216,
    writeOpsCost: 0.0045,
    readOpsCost: 0.00036,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.0765,
  },
  option2: {
    storagePerGbMonth: 0.01242,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.0765,
  },
};

/** Middle East UAE (me-central-1) */
const AWS_ME: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.024,
    writeOpsCost: 0.0055,
    readOpsCost: 0.00044,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.085,
  },
  option2: {
    storagePerGbMonth: 0.0138,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.085,
  },
};

/** Africa Cape Town (af-south-1) */
const AWS_AF: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.0262,
    writeOpsCost: 0.006,
    readOpsCost: 0.0004,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.147,
  },
  option2: {
    storagePerGbMonth: 0.0149,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.147,
  },
};

/** South America São Paulo (sa-east-1) */
const AWS_SA: PricingGroup = {
  provider: "AWS" as CloudProvider,
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.039,
    writeOpsCost: 0.007,
    readOpsCost: 0.00056,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.138,
  },
  option2: {
    storagePerGbMonth: 0.0221,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.138,
  },
};

// ─── AZURE PRICING GROUPS ─────────────────────────────────────────────────────
//
// option1 = Blob Hot LRS   (opsBatchSize 10000, retrievalPerGb 0)
// option2 = Blob Cool LRS  (opsBatchSize 10000, retrievalPerGb varies)

/** US Standard (centralus, eastus2, southcentralus, westus2) */
const AZURE_US_STD: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.0184,
    writeOpsCost: 0.05,
    readOpsCost: 0.004,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.087,
  },
  option2: {
    storagePerGbMonth: 0.01,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.087,
  },
};

/** US East + North Central (eastus, northcentralus) */
const AZURE_US_EAST: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.0208,
    writeOpsCost: 0.05,
    readOpsCost: 0.004,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.087,
  },
  option2: {
    storagePerGbMonth: 0.0152,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.087,
  },
};

/** US West (westus) */
const AZURE_US_WEST: PricingGroup = {
  provider: "Azure" as CloudProvider,
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

/** Canada (canadacentral, canadaeast) */
const AZURE_CA: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.02,
    writeOpsCost: 0.055,
    readOpsCost: 0.0044,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.087,
  },
  option2: {
    storagePerGbMonth: 0.011,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.087,
  },
};

/** Australia East (australiaeast) */
const AZURE_AU_E: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.02,
    writeOpsCost: 0.055,
    readOpsCost: 0.0044,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.12,
  },
  option2: {
    storagePerGbMonth: 0.011,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.12,
  },
};

/** Australia Southeast (australiasoutheast) */
const AZURE_AU_SE: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.02,
    writeOpsCost: 0.055,
    readOpsCost: 0.0044,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.12,
  },
  option2: {
    storagePerGbMonth: 0.015,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.12,
  },
};

/** EU France Central + UK South (francecentral, uksouth) */
const AZURE_EU_FR_UK: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.0192,
    writeOpsCost: 0.059,
    readOpsCost: 0.0047,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.087,
  },
  option2: {
    storagePerGbMonth: 0.0105,
    writeOpsCost: 0.11,
    readOpsCost: 0.011,
    opsBatchSize: 10000,
    retrievalPerGb: 0.011,
    egressPerGb: 0.087,
  },
};

/** EU Germany + Netherlands + Austria (germanywestcentral, westeurope, austriaeast) */
const AZURE_EU_DE_NL_AT: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.0196,
    writeOpsCost: 0.054,
    readOpsCost: 0.0043,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.087,
  },
  option2: {
    storagePerGbMonth: 0.01,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.087,
  },
};

/** EU North (Ireland) (northeurope) */
const AZURE_EU_IE: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.022,
    writeOpsCost: 0.05,
    readOpsCost: 0.004,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.087,
  },
  option2: {
    storagePerGbMonth: 0.01,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.087,
  },
};

/** EU Sweden (swedencentral) */
const AZURE_EU_SE: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.0184,
    writeOpsCost: 0.05,
    readOpsCost: 0.004,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.087,
  },
  option2: {
    storagePerGbMonth: 0.01,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.087,
  },
};

/** EU Italy North (italynorth) */
const AZURE_EU_IT: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.0192,
    writeOpsCost: 0.053,
    readOpsCost: 0.004,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.087,
  },
  option2: {
    storagePerGbMonth: 0.01,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.087,
  },
};

/** EU Switzerland North (switzerlandnorth) */
const AZURE_EU_CH: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.02156,
    writeOpsCost: 0.054,
    readOpsCost: 0.0043,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.087,
  },
  option2: {
    storagePerGbMonth: 0.011,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.087,
  },
};

/** AP Japan East + West (japaneast, japanwest) */
const AZURE_JP: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.02,
    writeOpsCost: 0.05,
    readOpsCost: 0.004,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.12,
  },
  option2: {
    storagePerGbMonth: 0.011,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.12,
  },
};

/** AP Korea Central (koreacentral) */
const AZURE_KR: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.02,
    writeOpsCost: 0.05,
    readOpsCost: 0.004,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.12,
  },
  option2: {
    storagePerGbMonth: 0.011,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.12,
  },
};

/** AP India Central (centralindia) */
const AZURE_IN_C: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.02,
    writeOpsCost: 0.055,
    readOpsCost: 0.0044,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.12,
  },
  option2: {
    storagePerGbMonth: 0.011,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.12,
  },
};

/** AP India South (southindia) */
const AZURE_IN_S: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.0238,
    writeOpsCost: 0.05,
    readOpsCost: 0.004,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.12,
  },
  option2: {
    storagePerGbMonth: 0.015,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.12,
  },
};

/** AP Southeast Asia / Singapore (southeastasia) */
const AZURE_SEA: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.02,
    writeOpsCost: 0.05,
    readOpsCost: 0.004,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.12,
  },
  option2: {
    storagePerGbMonth: 0.011,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.12,
  },
};

/** AP East Asia / Hong Kong (eastasia) */
const AZURE_EA: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.024,
    writeOpsCost: 0.05,
    readOpsCost: 0.004,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.12,
  },
  option2: {
    storagePerGbMonth: 0.011,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.12,
  },
};

/** AP Indonesia + Malaysia (indonesiacentral, malaysiawest) */
const AZURE_INDO_MY: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.018,
    writeOpsCost: 0.045,
    readOpsCost: 0.0036,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.12,
  },
  option2: {
    storagePerGbMonth: 0.01,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.12,
  },
};

/** AP New Zealand North (newzealandnorth) */
const AZURE_NZ: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.02,
    writeOpsCost: 0.05775,
    readOpsCost: 0.00462,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.12,
  },
  option2: {
    storagePerGbMonth: 0.01155,
    writeOpsCost: 0.105,
    readOpsCost: 0.0105,
    opsBatchSize: 10000,
    retrievalPerGb: 0.0105,
    egressPerGb: 0.12,
  },
};

/** Middle East Israel Central (israelcentral) */
const AZURE_IL: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.02,
    writeOpsCost: 0.055,
    readOpsCost: 0.0044,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.087,
  },
  option2: {
    storagePerGbMonth: 0.01104,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.087,
  },
};

/** Middle East UAE North (uaenorth) */
const AZURE_UAE: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.020275,
    writeOpsCost: 0.06,
    readOpsCost: 0.0048,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.181,
  },
  option2: {
    storagePerGbMonth: 0.012,
    writeOpsCost: 0.12,
    readOpsCost: 0.012,
    opsBatchSize: 10000,
    retrievalPerGb: 0.012,
    egressPerGb: 0.181,
  },
};

/** Africa South Africa North (southafricanorth) */
const AZURE_ZA_N: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.0219,
    writeOpsCost: 0.06,
    readOpsCost: 0.004,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.181,
  },
  option2: {
    storagePerGbMonth: 0.0119,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.181,
  },
};

/** Africa South Africa West (southafricawest) */
const AZURE_ZA_W: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.0274,
    writeOpsCost: 0.075,
    readOpsCost: 0.005,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.181,
  },
  option2: {
    storagePerGbMonth: 0.0149,
    writeOpsCost: 0.125,
    readOpsCost: 0.0125,
    opsBatchSize: 10000,
    retrievalPerGb: 0.0125,
    egressPerGb: 0.181,
  },
};

/** South America Brazil South (brazilsouth) */
const AZURE_BR: PricingGroup = {
  provider: "Azure" as CloudProvider,
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.0326,
    writeOpsCost: 0.07,
    readOpsCost: 0.0056,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.181,
  },
  option2: {
    storagePerGbMonth: 0.0177,
    writeOpsCost: 0.1,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.181,
  },
};

// ─── CLOUD_PRICING EXPORT ─────────────────────────────────────────────────────

export const CLOUD_PRICING: Record<string, RegionCloudPricing> = {
  // ── AWS US ──────────────────────────────────────────────────────────────────
  "aws-us-east-1": { regionId: "aws-us-east-1", ...AWS_US },
  "aws-us-east-2": { regionId: "aws-us-east-2", ...AWS_US },
  "aws-us-west-2": { regionId: "aws-us-west-2", ...AWS_US },

  // ── AWS Canada ──────────────────────────────────────────────────────────────
  "aws-ca-central-1": { regionId: "aws-ca-central-1", ...AWS_CA },

  // ── AWS Europe ──────────────────────────────────────────────────────────────
  "aws-eu-central-1": { regionId: "aws-eu-central-1", ...AWS_EU_DE },
  "aws-eu-north-1": { regionId: "aws-eu-north-1", ...AWS_US }, // Stockholm == US pricing
  "aws-eu-west-2": { regionId: "aws-eu-west-2", ...AWS_EU_GB_FR },
  "aws-eu-west-3": { regionId: "aws-eu-west-3", ...AWS_EU_GB_FR },
  "aws-eu-central-2": { regionId: "aws-eu-central-2", ...AWS_EU_ZH },
  "aws-eu-south-1": { regionId: "aws-eu-south-1", ...AWS_EU_MI },
  "aws-eu-south-2": { regionId: "aws-eu-south-2", ...AWS_EU_ES },

  // ── AWS Middle East ─────────────────────────────────────────────────────────
  "aws-il-central-1": { regionId: "aws-il-central-1", ...AWS_IL },

  // ── AWS Asia Pacific ────────────────────────────────────────────────────────
  "aws-ap-northeast-1": { regionId: "aws-ap-northeast-1", ...AWS_AP_JP },
  "aws-ap-northeast-2": { regionId: "aws-ap-northeast-2", ...AWS_AP_KR },
  "aws-ap-northeast-3": { regionId: "aws-ap-northeast-3", ...AWS_AP_JP },
  "aws-ap-south-1": { regionId: "aws-ap-south-1", ...AWS_AP_IN },
  "aws-ap-south-2": { regionId: "aws-ap-south-2", ...AWS_AP_IN },
  "aws-ap-southeast-1": { regionId: "aws-ap-southeast-1", ...AWS_AP_SG },
  "aws-ap-southeast-2": { regionId: "aws-ap-southeast-2", ...AWS_AP_AU },
  "aws-ap-east-1": { regionId: "aws-ap-east-1", ...AWS_AP_SG },
  "aws-ap-east-2": { regionId: "aws-ap-east-2", ...AWS_AP_MY },
  "aws-ap-southeast-3": { regionId: "aws-ap-southeast-3", ...AWS_AP_JK },
  "aws-ap-southeast-5": { regionId: "aws-ap-southeast-5", ...AWS_AP_NEW },
  "aws-ap-southeast-7": { regionId: "aws-ap-southeast-7", ...AWS_AP_NEW },

  // ── AWS Middle East ─────────────────────────────────────────────────────────
  "aws-me-central-1": { regionId: "aws-me-central-1", ...AWS_ME },

  // ── AWS Africa ──────────────────────────────────────────────────────────────
  "aws-af-south-1": { regionId: "aws-af-south-1", ...AWS_AF },

  // ── AWS South America ───────────────────────────────────────────────────────
  "aws-sa-east-1": { regionId: "aws-sa-east-1", ...AWS_SA },

  // ── Azure US ────────────────────────────────────────────────────────────────
  "azure-us-central": { regionId: "azure-us-central", ...AZURE_US_STD },
  "azure-us-east": { regionId: "azure-us-east", ...AZURE_US_EAST },
  "azure-us-east2": { regionId: "azure-us-east2", ...AZURE_US_STD },
  "azure-us-north-central": {
    regionId: "azure-us-north-central",
    ...AZURE_US_EAST,
  },
  "azure-us-south-central": {
    regionId: "azure-us-south-central",
    ...AZURE_US_STD,
  },
  "azure-us-west2": { regionId: "azure-us-west2", ...AZURE_US_STD },
  "azure-us-west": { regionId: "azure-us-west", ...AZURE_US_WEST },

  // ── Azure Canada ────────────────────────────────────────────────────────────
  "azure-canada-central": { regionId: "azure-canada-central", ...AZURE_CA },
  "azure-canada-east": { regionId: "azure-canada-east", ...AZURE_CA },

  // ── Azure Australia ─────────────────────────────────────────────────────────
  "azure-au-east": { regionId: "azure-au-east", ...AZURE_AU_E },
  "azure-australia-southeast": {
    regionId: "azure-australia-southeast",
    ...AZURE_AU_SE,
  },

  // ── Azure Europe ────────────────────────────────────────────────────────────
  "azure-france-central": {
    regionId: "azure-france-central",
    ...AZURE_EU_FR_UK,
  },
  "azure-germany-west-central": {
    regionId: "azure-germany-west-central",
    ...AZURE_EU_DE_NL_AT,
  },
  "azure-north-europe": { regionId: "azure-north-europe", ...AZURE_EU_IE },
  "azure-sweden-central": { regionId: "azure-sweden-central", ...AZURE_EU_SE },
  "azure-uk-south": { regionId: "azure-uk-south", ...AZURE_EU_FR_UK },
  "azure-west-europe": { regionId: "azure-west-europe", ...AZURE_EU_DE_NL_AT },
  "azure-austria-east": {
    regionId: "azure-austria-east",
    ...AZURE_EU_DE_NL_AT,
  },
  "azure-italy-north": { regionId: "azure-italy-north", ...AZURE_EU_IT },
  "azure-switzerland-north": {
    regionId: "azure-switzerland-north",
    ...AZURE_EU_CH,
  },

  // ── Azure Asia Pacific ──────────────────────────────────────────────────────
  "azure-japan-east": { regionId: "azure-japan-east", ...AZURE_JP },
  "azure-japan-west": { regionId: "azure-japan-west", ...AZURE_JP },
  "azure-korea-central": { regionId: "azure-korea-central", ...AZURE_KR },
  "azure-india-central": { regionId: "azure-india-central", ...AZURE_IN_C },
  "azure-south-india": { regionId: "azure-south-india", ...AZURE_IN_S },
  "azure-southeast-asia": { regionId: "azure-southeast-asia", ...AZURE_SEA },
  "azure-east-asia": { regionId: "azure-east-asia", ...AZURE_EA },
  "azure-indonesia-central": {
    regionId: "azure-indonesia-central",
    ...AZURE_INDO_MY,
  },
  "azure-malaysia-west": { regionId: "azure-malaysia-west", ...AZURE_INDO_MY },
  "azure-nz-north": { regionId: "azure-nz-north", ...AZURE_NZ },

  // ── Azure Middle East ───────────────────────────────────────────────────────
  "azure-israel-central": { regionId: "azure-israel-central", ...AZURE_IL },
  "azure-uae-north": { regionId: "azure-uae-north", ...AZURE_UAE },

  // ── Azure Africa ────────────────────────────────────────────────────────────
  "azure-south-africa-north": {
    regionId: "azure-south-africa-north",
    ...AZURE_ZA_N,
  },
  "azure-south-africa-west": {
    regionId: "azure-south-africa-west",
    ...AZURE_ZA_W,
  },

  // ── Azure South America ─────────────────────────────────────────────────────
  "azure-brazil-south": { regionId: "azure-brazil-south", ...AZURE_BR },
};
