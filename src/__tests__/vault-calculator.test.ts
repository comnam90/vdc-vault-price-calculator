import { describe, expect, it } from "vitest";
import { calculateVaultCost } from "@/lib/vault-calculator";

describe("calculateVaultCost", () => {
  it("returns correct total for 10 TiB, 3 years, Foundation Core", () => {
    const result = calculateVaultCost(10, 3, "Foundation", "Core");
    expect(result.total).toBe(5040);
    expect(result.perTbMonth).toBe(14);
    expect(result.pricingTbd).toBe(false);
  });

  it("returns correct total for 10 TiB, 1 year, Advanced Core", () => {
    const result = calculateVaultCost(10, 1, "Advanced", "Core");
    expect(result.total).toBe(2880);
    expect(result.perTbMonth).toBe(24);
    expect(result.pricingTbd).toBe(false);
  });

  it("returns null totals with pricingTbd true for Foundation Non-Core", () => {
    const result = calculateVaultCost(10, 1, "Foundation", "Non-Core");
    expect(result.total).toBeNull();
    expect(result.perTbMonth).toBeNull();
    expect(result.pricingTbd).toBe(true);
  });

  it("returns null totals with pricingTbd true for Advanced Non-Core", () => {
    const result = calculateVaultCost(10, 1, "Advanced", "Non-Core");
    expect(result.total).toBeNull();
    expect(result.perTbMonth).toBeNull();
    expect(result.pricingTbd).toBe(true);
  });

  it("returns null total gracefully for an invalid edition-tier combo", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = calculateVaultCost(
      10,
      1,
      "Foundation" as any,
      "Premium" as any,
    );
    expect(result.total).toBeNull();
    expect(result.perTbMonth).toBeNull();
    expect(result.pricingTbd).toBe(false);
  });

  it("returns 168 for 1 TiB, 1 year, Foundation Core", () => {
    const result = calculateVaultCost(1, 1, "Foundation", "Core");
    expect(result.total).toBe(168);
    expect(result.perTbMonth).toBe(14);
  });

  it("returns 144000 for 100 TiB, 5 years, Advanced Core", () => {
    const result = calculateVaultCost(100, 5, "Advanced", "Core");
    expect(result.total).toBe(144000);
    expect(result.perTbMonth).toBe(24);
  });
});
