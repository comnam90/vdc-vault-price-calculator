import { describe, it, expect } from "vitest";
import { VAULT_PRICING } from "@/data/vault-pricing";
import { CLOUD_PRICING } from "@/data/cloud-pricing";

describe("type contracts", () => {
  it("vault pricing entries have non-negative prices", () => {
    for (const entry of VAULT_PRICING) {
      expect(entry.pricePerTbMonth).toBeGreaterThanOrEqual(0);
    }
  });

  it("vault pricing covers all 4 edition/tier combos", () => {
    expect(VAULT_PRICING).toHaveLength(4);
    const keys = VAULT_PRICING.map((p) => `${p.edition}-${p.tier}`);
    expect(keys).toContain("Foundation-Core");
    expect(keys).toContain("Advanced-Core");
    expect(keys).toContain("Foundation-Non-Core");
    expect(keys).toContain("Advanced-Non-Core");
  });

  it("cloud pricing region IDs are lowercase-hyphenated", () => {
    for (const regionId of Object.keys(CLOUD_PRICING)) {
      expect(regionId).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("cloud pricing provider matches region ID prefix", () => {
    for (const [regionId, pricing] of Object.entries(CLOUD_PRICING)) {
      if (regionId.startsWith("aws-")) {
        expect(pricing.provider).toBe("AWS");
      } else if (regionId.startsWith("azure-")) {
        expect(pricing.provider).toBe("Azure");
      }
    }
  });
});
