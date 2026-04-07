import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  FIXTURE_CAPACITY_TIB,
  FIXTURE_TERM_YEARS,
  fixtureComparison,
} from "@/__tests__/fixtures/comparison-result";
import { ResultsPanel } from "@/components/results/results-panel";

vi.mock("@/components/results/summary-cards", () => ({
  SummaryCards: () => <div data-testid="summary-cards">Summary cards</div>,
}));

vi.mock("@/components/results/comparison-chart", () => ({
  ComparisonChart: () => (
    <div data-testid="comparison-chart">Comparison chart</div>
  ),
}));

vi.mock("@/components/results/cost-breakdown-table", () => ({
  CostBreakdownTable: () => (
    <div data-testid="cost-breakdown-table">Cost breakdown table</div>
  ),
}));

describe("ResultsPanel", () => {
  it("returns null when no comparison is available", () => {
    const { container } = render(
      <ResultsPanel
        comparison={null}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders overview and breakdown tabs with the expected result components", () => {
    render(
      <ResultsPanel
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
      />,
    );

    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Breakdown" })).toBeInTheDocument();
    expect(screen.getByTestId("summary-cards")).toBeInTheDocument();
    expect(screen.getByTestId("comparison-chart")).toBeInTheDocument();

    const breakdownTab = screen.getByRole("tab", { name: "Breakdown" });
    fireEvent.mouseDown(breakdownTab);
    fireEvent.click(breakdownTab);

    expect(screen.getByTestId("cost-breakdown-table")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /calculation assumptions/i }),
    ).toBeInTheDocument();
  });

  it("shows the non-core pricing banner when comparison data includes TBD vault totals", () => {
    render(
      <ResultsPanel
        comparison={{
          ...fixtureComparison,
          vaultAdvanced: {
            total: null,
            perTbMonth: null,
            pricingTbd: true,
          },
        }}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
      />,
    );

    expect(
      screen.getByText(/non-core pricing has not yet been announced/i),
    ).toBeInTheDocument();
  });
});
