import { describe, expect, it } from "vitest";
import { VAULT_PRICING, getVaultPrice } from "@/data/vault-pricing";

describe("VAULT_PRICING", () => {
  it("contains exactly 4 entries", () => {
    expect(VAULT_PRICING).toHaveLength(4);
  });

  it("Foundation Core price is $14/TB/month", () => {
    const entry = VAULT_PRICING.find(
      (p) => p.edition === "Foundation" && p.tier === "Core",
    );
    expect(entry?.pricePerTbMonth).toBe(14);
  });

  it("Advanced Core price is $24/TB/month", () => {
    const entry = VAULT_PRICING.find(
      (p) => p.edition === "Advanced" && p.tier === "Core",
    );
    expect(entry?.pricePerTbMonth).toBe(24);
  });

  it("Non-Core prices are 0 (TBD placeholder)", () => {
    const nonCore = VAULT_PRICING.filter((p) => p.tier === "Non-Core");
    expect(nonCore).toHaveLength(2);
    nonCore.forEach((p) => expect(p.pricePerTbMonth).toBe(0));
  });
});

describe("getVaultPrice", () => {
  it("returns Foundation Core pricing", () => {
    const result = getVaultPrice("Foundation", "Core");
    expect(result).toMatchObject({
      edition: "Foundation",
      tier: "Core",
      pricePerTbMonth: 14,
    });
  });

  it("returns Advanced Core pricing", () => {
    const result = getVaultPrice("Advanced", "Core");
    expect(result).toMatchObject({
      edition: "Advanced",
      tier: "Core",
      pricePerTbMonth: 24,
    });
  });

  it("returns Foundation Non-Core pricing with pricePerTbMonth 0", () => {
    const result = getVaultPrice("Foundation", "Non-Core");
    expect(result).toMatchObject({
      edition: "Foundation",
      tier: "Non-Core",
      pricePerTbMonth: 0,
    });
  });

  it("returns undefined for unknown edition/tier combo", () => {
    expect(getVaultPrice("Unknown", "Core")).toBeUndefined();
  });
});
