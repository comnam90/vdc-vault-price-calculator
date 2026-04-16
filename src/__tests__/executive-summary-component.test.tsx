import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  FIXTURE_CAPACITY_TIB,
  FIXTURE_TERM_YEARS,
  fixtureComparison,
} from "@/__tests__/fixtures/comparison-result";
import { ExecutiveSummary } from "@/components/results/executive-summary";
import type { ComparisonResult } from "@/types/calculator";

vi.mock("@/hooks/use-animated-counter", () => ({
  useAnimatedCounter: (target: number) => target,
}));

const DEFAULT_SCOPE = {
  capacityTiB: FIXTURE_CAPACITY_TIB,
  termYears: FIXTURE_TERM_YEARS,
  regionLabel: "AWS · US East (N. Virginia)",
} as const;

describe("ExecutiveSummary", () => {
  it("renders cheapest DIY total formatted as USD with its label", () => {
    render(
      <ExecutiveSummary comparison={fixtureComparison} {...DEFAULT_SCOPE} />,
    );

    expect(screen.getByText("$4,500.00")).toBeInTheDocument();
    expect(screen.getAllByText("S3 Infrequent Access").length).toBeGreaterThan(
      0,
    );
  });

  it("renders cheapest Vault total formatted as USD with its label", () => {
    render(
      <ExecutiveSummary comparison={fixtureComparison} {...DEFAULT_SCOPE} />,
    );

    expect(screen.getByText("$5,040.00")).toBeInTheDocument();
    expect(screen.getAllByText("VDC Vault Foundation").length).toBeGreaterThan(
      0,
    );
  });

  it("renders savings absolute and percentage", () => {
    const comparison: ComparisonResult = {
      ...fixtureComparison,
      vaultFoundation: { total: 3000, perTbMonth: 10, pricingTbd: false },
    };

    render(<ExecutiveSummary comparison={comparison} {...DEFAULT_SCOPE} />);

    const savingsBlock =
      screen.getByText(/^projected savings$/i).parentElement!;
    expect(within(savingsBlock).getByText("$1,500.00")).toBeInTheDocument();
    expect(within(savingsBlock).getByText(/33\.3%/)).toBeInTheDocument();
  });

  it("shows Pricing TBD when both vault options have null totals", () => {
    const comparison: ComparisonResult = {
      ...fixtureComparison,
      vaultFoundation: { total: null, perTbMonth: null, pricingTbd: true },
      vaultAdvanced: { total: null, perTbMonth: null, pricingTbd: true },
    };

    render(<ExecutiveSummary comparison={comparison} {...DEFAULT_SCOPE} />);

    expect(screen.getByText("Pricing TBD")).toBeInTheDocument();
  });

  it("applies font-mono to numeric values", () => {
    render(
      <ExecutiveSummary comparison={fixtureComparison} {...DEFAULT_SCOPE} />,
    );

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

    render(<ExecutiveSummary comparison={comparison} {...DEFAULT_SCOPE} />);

    const savingsBlock =
      screen.getByText(/^projected savings$/i).parentElement!;
    const savingsValue = within(savingsBlock).getByText("$2,500.00");
    expect(savingsValue.className).toMatch(/viridis/);
  });

  it("uses ignis color for savings text when DIY wins", () => {
    render(
      <ExecutiveSummary comparison={fixtureComparison} {...DEFAULT_SCOPE} />,
    );

    const savingsBlock =
      screen.getByText(/^projected savings$/i).parentElement!;
    const savingsValue = within(savingsBlock).getByText("$540.00");
    expect(savingsValue.className).toMatch(/ignis/);
  });

  it("has accessible labels for metric blocks", () => {
    render(
      <ExecutiveSummary comparison={fixtureComparison} {...DEFAULT_SCOPE} />,
    );

    expect(screen.getByText(/cheapest diy/i)).toBeInTheDocument();
    expect(screen.getByText(/cheapest vault/i)).toBeInTheDocument();
    expect(screen.getByText(/projected savings/i)).toBeInTheDocument();
  });

  describe("scope header", () => {
    it("shows capacity, region, and term context", () => {
      render(
        <ExecutiveSummary
          comparison={fixtureComparison}
          capacityTiB={25}
          termYears={3}
          regionLabel="Azure · East US"
        />,
      );

      expect(screen.getByText(/capacity/i)).toBeInTheDocument();
      expect(screen.getByText("25 TiB")).toBeInTheDocument();
      expect(screen.getByText(/region/i)).toBeInTheDocument();
      expect(screen.getByText("Azure · East US")).toBeInTheDocument();
      expect(screen.getByText(/^term$/i)).toBeInTheDocument();
      expect(screen.getByText("3 years")).toBeInTheDocument();
    });

    it("uses singular year label for one-year terms", () => {
      render(
        <ExecutiveSummary
          comparison={fixtureComparison}
          capacityTiB={10}
          termYears={1}
          regionLabel="AWS · us-east-1"
        />,
      );

      expect(screen.getByText("1 year")).toBeInTheDocument();
    });
  });

  describe("recommendation", () => {
    it("recommends Vault when Vault is cheapest and mentions savings + term", () => {
      const comparison: ComparisonResult = {
        ...fixtureComparison,
        vaultFoundation: { total: 3000, perTbMonth: 10, pricingTbd: false },
      };

      render(<ExecutiveSummary comparison={comparison} {...DEFAULT_SCOPE} />);

      const recommendationLabel = screen.getByText(/^recommendation$/i);
      const recommendationBlock = recommendationLabel.parentElement!;
      expect(recommendationBlock).toHaveTextContent(
        /Choose VDC Vault Foundation/,
      );
      expect(recommendationBlock).toHaveTextContent(/\$1,500\.00/);
      expect(recommendationBlock).toHaveTextContent(/33\.3%/);
      expect(recommendationBlock).toHaveTextContent(/over 3 years/);
      expect(recommendationBlock).toHaveTextContent(/S3 Infrequent Access/);
    });

    it("recommends the DIY option when DIY is cheaper", () => {
      render(
        <ExecutiveSummary comparison={fixtureComparison} {...DEFAULT_SCOPE} />,
      );

      const recommendationBlock =
        screen.getByText(/^recommendation$/i).parentElement!;
      expect(recommendationBlock).toHaveTextContent(/S3 Infrequent Access/);
      expect(recommendationBlock).toHaveTextContent(/cheaper here/);
      expect(recommendationBlock).toHaveTextContent(/\$540\.00/);
      expect(recommendationBlock).toHaveTextContent(/VDC Vault Foundation/);
    });

    it("surfaces cost-equivalent phrasing when savings are zero", () => {
      const comparison: ComparisonResult = {
        ...fixtureComparison,
        vaultFoundation: { total: 4500, perTbMonth: 12.5, pricingTbd: false },
      };

      render(<ExecutiveSummary comparison={comparison} {...DEFAULT_SCOPE} />);

      const recommendationBlock =
        screen.getByText(/^recommendation$/i).parentElement!;
      expect(recommendationBlock).toHaveTextContent(/cost-equivalent/i);
    });

    it("explains that Vault pricing is TBD when no recommendation is possible", () => {
      const comparison: ComparisonResult = {
        ...fixtureComparison,
        vaultFoundation: { total: null, perTbMonth: null, pricingTbd: true },
        vaultAdvanced: { total: null, perTbMonth: null, pricingTbd: true },
      };

      render(<ExecutiveSummary comparison={comparison} {...DEFAULT_SCOPE} />);

      const recommendationBlock =
        screen.getByText(/^recommendation$/i).parentElement!;
      expect(recommendationBlock).toHaveTextContent(/not yet published/i);
    });
  });
});
