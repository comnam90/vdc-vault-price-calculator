import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { fixtureComparison } from "@/__tests__/fixtures/comparison-result";
import { ExecutiveSummary } from "@/components/results/executive-summary";
import type { ComparisonResult } from "@/types/calculator";

vi.mock("@/hooks/use-animated-counter", () => ({
  useAnimatedCounter: (target: number) => target,
}));

describe("ExecutiveSummary", () => {
  it("renders cheapest DIY total formatted as USD with its label", () => {
    render(<ExecutiveSummary comparison={fixtureComparison} />);

    expect(screen.getByText("$4,500.00")).toBeInTheDocument();
    expect(screen.getByText("S3 Infrequent Access")).toBeInTheDocument();
  });

  it("renders cheapest Vault total formatted as USD with its label", () => {
    render(<ExecutiveSummary comparison={fixtureComparison} />);

    expect(screen.getByText("$5,040.00")).toBeInTheDocument();
    expect(screen.getByText("VDC Vault Foundation")).toBeInTheDocument();
  });

  it("renders savings absolute and percentage", () => {
    // Vault is $5040, DIY is $4500 — DIY wins, savings from Vault perspective is negative
    // But let's make Vault win for a clearer test
    const comparison: ComparisonResult = {
      ...fixtureComparison,
      vaultFoundation: { total: 3000, perTbMonth: 10, pricingTbd: false },
    };

    render(<ExecutiveSummary comparison={comparison} />);

    // Savings = 4500 - 3000 = $1,500.00
    expect(screen.getByText("$1,500.00")).toBeInTheDocument();
    // Percentage: 1500/4500 * 100 = 33.33%
    expect(screen.getByText(/33\.3%/)).toBeInTheDocument();
  });

  it("shows Pricing TBD when both vault options have null totals", () => {
    const comparison: ComparisonResult = {
      ...fixtureComparison,
      vaultFoundation: { total: null, perTbMonth: null, pricingTbd: true },
      vaultAdvanced: { total: null, perTbMonth: null, pricingTbd: true },
    };

    render(<ExecutiveSummary comparison={comparison} />);

    expect(screen.getByText("Pricing TBD")).toBeInTheDocument();
  });

  it("applies font-mono to numeric values", () => {
    render(<ExecutiveSummary comparison={fixtureComparison} />);

    const diyTotal = screen.getByText("$4,500.00");
    expect(diyTotal).toHaveClass("font-mono");

    const vaultTotal = screen.getByText("$5,040.00");
    expect(vaultTotal).toHaveClass("font-mono");
  });

  it("uses viridis color for savings text when Vault wins", () => {
    const comparison: ComparisonResult = {
      ...fixtureComparison,
      vaultFoundation: { total: 2000, perTbMonth: 8, pricingTbd: false },
    };

    render(<ExecutiveSummary comparison={comparison} />);

    const savingsValue = screen.getByText("$2,500.00");
    expect(savingsValue.className).toMatch(/viridis/);
  });

  it("uses ignis color for savings text when DIY wins", () => {
    render(<ExecutiveSummary comparison={fixtureComparison} />);

    // DIY ($4500) < Vault ($5040), so DIY wins
    const savingsValue = screen.getByText("$540.00");
    expect(savingsValue.className).toMatch(/ignis/);
  });

  it("has accessible labels for metric blocks", () => {
    render(<ExecutiveSummary comparison={fixtureComparison} />);

    expect(screen.getByText(/cheapest diy/i)).toBeInTheDocument();
    expect(screen.getByText(/cheapest vault/i)).toBeInTheDocument();
    expect(screen.getByText(/projected savings/i)).toBeInTheDocument();
  });
});
