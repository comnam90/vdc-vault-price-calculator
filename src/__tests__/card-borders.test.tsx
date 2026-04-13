import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  FIXTURE_CAPACITY_TIB,
  FIXTURE_TERM_YEARS,
  fixtureComparison,
} from "@/__tests__/fixtures/comparison-result";
import { CalculatorForm } from "@/components/calculator/calculator-form";
import { ComparisonChart } from "@/components/results/comparison-chart";
import { CostBreakdownTable } from "@/components/results/cost-breakdown-table";
import { CostTrendChart } from "@/components/results/cost-trend-chart";
import { ResultsPanel } from "@/components/results/results-panel";

vi.mock("@/hooks/use-regions", () => ({
  useRegions: vi
    .fn()
    .mockReturnValue({ regions: [], isLoading: false, error: null }),
}));

function collectClassTokens() {
  return Array.from(document.body.querySelectorAll("[class]")).flatMap((el) =>
    (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean),
  );
}

// Matches the large diffuse card shadows: shadow-[0_Npx_Npx_-Npx_color-mix(...)]
const diffuseShadowPattern = /^shadow-\[0_\d+px_\d+px_-\d+px_color-mix/;

describe("card borders", () => {
  it("gradient-header card wrappers have pt-0 and overflow-hidden to eliminate the white gap", () => {
    // Render each gradient-header card directly: ResultsPanel renders CostBreakdownTable
    // and CostTrendChart inside inactive Radix tabs, so they are not in the DOM unless
    // the tab is activated. Render them explicitly to cover all four cards.
    render(
      <>
        <CalculatorForm onInputsChange={vi.fn()} />
        <ComparisonChart comparison={fixtureComparison} />
        <CostBreakdownTable comparison={fixtureComparison} />
        <CostTrendChart
          comparison={fixtureComparison}
          termYears={FIXTURE_TERM_YEARS}
        />
      </>,
    );

    const gradientHeaders = Array.from(
      document.body.querySelectorAll<HTMLElement>(
        '[class*="surface-gradient"]',
      ),
    );
    expect(gradientHeaders).toHaveLength(4);

    gradientHeaders.forEach((header) => {
      const card = header.parentElement;
      expect(card?.className).toMatch(/\bpt-0\b/);
      expect(card?.className).toMatch(/\boverflow-hidden\b/);
    });
  });

  it("renders card components without large diffuse shadows", () => {
    render(
      <>
        <CalculatorForm onInputsChange={vi.fn()} />
        <ResultsPanel
          comparison={fixtureComparison}
          capacityTiB={FIXTURE_CAPACITY_TIB}
          termYears={FIXTURE_TERM_YEARS}
          restorePercentage={20}
        />
      </>,
    );

    const diffuseShadowTokens = collectClassTokens().filter((t) =>
      diffuseShadowPattern.test(t),
    );

    expect(diffuseShadowTokens).toEqual([]);
  });
});
