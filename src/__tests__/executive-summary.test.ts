import { describe, expect, it } from "vitest";
import { fixtureComparison } from "@/__tests__/fixtures/comparison-result";
import { deriveExecutiveSummary } from "@/lib/executive-summary";
import type { ComparisonResult } from "@/types/calculator";

describe("deriveExecutiveSummary", () => {
  it("returns cheapest DIY and Vault with correct savings when Vault wins", () => {
    // fixtureComparison: Foundation=$5040, Advanced=$8640, DIY1=$9000, DIY2=$4500
    // cheapest Vault = Foundation $5040, cheapest DIY = DIY2 $4500
    // DIY wins here — savings is negative from Vault perspective
    const result = deriveExecutiveSummary(fixtureComparison);

    expect(result.cheapestDiy).toEqual({
      total: 4500,
      label: "S3 Infrequent Access",
    });
    expect(result.cheapestVault).toEqual({
      total: 5040,
      label: "VDC Vault Foundation",
    });
    expect(result.savings).toEqual({
      absolute: -540,
      percentage: expect.closeTo(-12, 0),
      vaultWins: false,
    });
  });

  it("returns positive savings when Vault is cheaper than DIY", () => {
    const comparison: ComparisonResult = {
      ...fixtureComparison,
      vaultFoundation: { total: 3000, perTbMonth: 10, pricingTbd: false },
    };

    const result = deriveExecutiveSummary(comparison);

    expect(result.cheapestVault).toEqual({
      total: 3000,
      label: "VDC Vault Foundation",
    });
    expect(result.cheapestDiy).toEqual({
      total: 4500,
      label: "S3 Infrequent Access",
    });
    expect(result.savings!.absolute).toBe(1500);
    expect(result.savings!.percentage).toBeCloseTo(33.33, 1);
    expect(result.savings!.vaultWins).toBe(true);
  });

  it("uses the other Vault option when one has TBD pricing", () => {
    const comparison: ComparisonResult = {
      ...fixtureComparison,
      vaultFoundation: { total: null, perTbMonth: null, pricingTbd: true },
      vaultAdvanced: { total: 4000, perTbMonth: 20, pricingTbd: false },
    };

    const result = deriveExecutiveSummary(comparison);

    expect(result.cheapestVault).toEqual({
      total: 4000,
      label: "VDC Vault Advanced",
    });
  });

  it("returns null cheapestVault and savings when both Vault options are TBD", () => {
    const comparison: ComparisonResult = {
      ...fixtureComparison,
      vaultFoundation: { total: null, perTbMonth: null, pricingTbd: true },
      vaultAdvanced: { total: null, perTbMonth: null, pricingTbd: true },
    };

    const result = deriveExecutiveSummary(comparison);

    expect(result.cheapestVault).toBeNull();
    expect(result.savings).toBeNull();
  });

  it("skips diyOption1 when unavailable and uses diyOption2", () => {
    const comparison: ComparisonResult = {
      ...fixtureComparison,
      diyOption1Unavailable: true,
    };

    const result = deriveExecutiveSummary(comparison);

    expect(result.cheapestDiy).toEqual({
      total: 4500,
      label: "S3 Infrequent Access",
    });
  });

  it("handles tie between Vault and DIY (savings = 0)", () => {
    const comparison: ComparisonResult = {
      ...fixtureComparison,
      vaultFoundation: { total: 4500, perTbMonth: 12.5, pricingTbd: false },
    };

    const result = deriveExecutiveSummary(comparison);

    expect(result.savings).toEqual({
      absolute: 0,
      percentage: 0,
      vaultWins: false,
    });
  });

  it("picks the cheaper of two available DIY options", () => {
    const comparison: ComparisonResult = {
      ...fixtureComparison,
      diyOption1: { ...fixtureComparison.diyOption1, total: 3000 },
      diyOption2: { ...fixtureComparison.diyOption2, total: 5000 },
    };

    const result = deriveExecutiveSummary(comparison);

    expect(result.cheapestDiy).toEqual({
      total: 3000,
      label: "S3 Standard",
    });
  });

  it("picks the cheaper of two available Vault options", () => {
    const comparison: ComparisonResult = {
      ...fixtureComparison,
      vaultFoundation: { total: 9000, perTbMonth: 25, pricingTbd: false },
      vaultAdvanced: { total: 7000, perTbMonth: 20, pricingTbd: false },
    };

    const result = deriveExecutiveSummary(comparison);

    expect(result.cheapestVault).toEqual({
      total: 7000,
      label: "VDC Vault Advanced",
    });
  });
});
