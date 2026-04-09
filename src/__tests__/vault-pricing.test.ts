import { describe, expect, it } from "vitest";
import { VAULT_PRICING, getVaultPrice } from "@/data/vault-pricing";

describe("VAULT_PRICING", () => {
  it("contains exactly 7 entries", () => {
    expect(VAULT_PRICING).toHaveLength(7);
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

  it("generic Non-Core fallbacks have price 0 (TBD)", () => {
    const genericNonCore = VAULT_PRICING.filter(
      (p) => p.tier === "Non-Core" && !p.provider,
    );
    expect(genericNonCore).toHaveLength(2);
    genericNonCore.forEach((p) => expect(p.pricePerTbMonth).toBe(0));
  });

  it("AWS Foundation Non-Core price is $19/TB/month", () => {
    const entry = VAULT_PRICING.find(
      (p) =>
        p.edition === "Foundation" &&
        p.tier === "Non-Core" &&
        p.provider === "AWS",
    );
    expect(entry?.pricePerTbMonth).toBe(19);
  });

  it("Azure Foundation Non-Core price is $24/TB/month", () => {
    const entry = VAULT_PRICING.find(
      (p) =>
        p.edition === "Foundation" &&
        p.tier === "Non-Core" &&
        p.provider === "Azure",
    );
    expect(entry?.pricePerTbMonth).toBe(24);
  });

  it("Azure Advanced Non-Core price is $40/TB/month", () => {
    const entry = VAULT_PRICING.find(
      (p) =>
        p.edition === "Advanced" &&
        p.tier === "Non-Core" &&
        p.provider === "Azure",
    );
    expect(entry?.pricePerTbMonth).toBe(40);
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

  it("returns generic Foundation Non-Core fallback (price 0) when no provider given", () => {
    const result = getVaultPrice("Foundation", "Non-Core");
    expect(result).toMatchObject({
      edition: "Foundation",
      tier: "Non-Core",
      pricePerTbMonth: 0,
    });
    expect(result?.provider).toBeUndefined();
  });

  it("returns AWS Foundation Non-Core price of $19 when provider is AWS", () => {
    const result = getVaultPrice("Foundation", "Non-Core", "AWS");
    expect(result?.pricePerTbMonth).toBe(19);
  });

  it("returns Azure Foundation Non-Core price of $24 when provider is Azure", () => {
    const result = getVaultPrice("Foundation", "Non-Core", "Azure");
    expect(result?.pricePerTbMonth).toBe(24);
  });

  it("returns Azure Advanced Non-Core price of $40 when provider is Azure", () => {
    const result = getVaultPrice("Advanced", "Non-Core", "Azure");
    expect(result?.pricePerTbMonth).toBe(40);
  });

  it("returns generic Advanced Non-Core fallback (price 0) for AWS Advanced", () => {
    const result = getVaultPrice("Advanced", "Non-Core", "AWS");
    expect(result?.pricePerTbMonth).toBe(0);
  });
});
