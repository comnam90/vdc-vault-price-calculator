import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  FIXTURE_CAPACITY_TIB,
  FIXTURE_TERM_YEARS,
  fixtureComparison,
} from "@/__tests__/fixtures/comparison-result";
import { ResultsPanel } from "@/components/results/results-panel";

vi.mock("@/components/results/cost-trend-chart", () => ({
  CostTrendChart: () => (
    <div data-testid="cost-trend-chart">Cost trend chart</div>
  ),
}));

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

vi.mock("@/components/results/executive-summary", () => ({
  ExecutiveSummary: () => (
    <div data-testid="executive-summary">Executive summary</div>
  ),
}));

describe("ResultsPanel", () => {
  it("returns null when no comparison is available", () => {
    const { container } = render(
      <ResultsPanel
        comparison={null}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
        restorePercentage={20}
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
        restorePercentage={20}
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

  it("shows a USD currency indicator next to the results heading", () => {
    render(
      <ResultsPanel
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
        restorePercentage={20}
      />,
    );

    const usdLabel = screen.getByText("(USD)");
    expect(usdLabel).toBeInTheDocument();
    expect(usdLabel.closest("h2")).toBeInTheDocument();
  });

  it("shows the Over time tab when termYears > 1", () => {
    render(
      <ResultsPanel
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={3}
        restorePercentage={20}
      />,
    );

    expect(screen.getByRole("tab", { name: /over time/i })).toBeInTheDocument();
  });

  it("does not show the Over time tab when termYears is 1", () => {
    render(
      <ResultsPanel
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={1}
        restorePercentage={20}
      />,
    );

    expect(
      screen.queryByRole("tab", { name: /over time/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the trend chart when the Over time tab is active", () => {
    render(
      <ResultsPanel
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={3}
        restorePercentage={20}
      />,
    );

    const trendTab = screen.getByRole("tab", { name: /over time/i });
    fireEvent.mouseDown(trendTab);
    fireEvent.click(trendTab);

    expect(screen.getByTestId("cost-trend-chart")).toBeInTheDocument();
  });

  it("resets to overview when termYears drops to 1 while on the trend tab", () => {
    const { rerender } = render(
      <ResultsPanel
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={3}
        restorePercentage={20}
      />,
    );

    const trendTab = screen.getByRole("tab", { name: /over time/i });
    fireEvent.mouseDown(trendTab);
    fireEvent.click(trendTab);
    expect(screen.getByTestId("cost-trend-chart")).toBeInTheDocument();

    rerender(
      <ResultsPanel
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={1}
        restorePercentage={20}
      />,
    );

    expect(
      screen.queryByRole("tab", { name: /over time/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("summary-cards")).toBeInTheDocument();
    expect(screen.getByTestId("comparison-chart")).toBeInTheDocument();
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
        restorePercentage={20}
      />,
    );

    expect(
      screen.getByText(/non-core pricing has not yet been announced/i),
    ).toBeInTheDocument();
  });

  it("threads restorePercentage to Assumptions", () => {
    render(
      <ResultsPanel
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
        restorePercentage={50}
      />,
    );

    const breakdownTab = screen.getByRole("tab", { name: "Breakdown" });
    fireEvent.mouseDown(breakdownTab);
    fireEvent.click(breakdownTab);

    fireEvent.click(
      screen.getByRole("button", { name: /calculation assumptions/i }),
    );

    expect(screen.getByText(/50% annual restore/i)).toBeInTheDocument();
  });

  it("renders the view mode toggle with Architect and Executive options", () => {
    render(
      <ResultsPanel
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
        restorePercentage={20}
      />,
    );

    expect(screen.getByRole("tab", { name: "Architect" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Executive" })).toBeInTheDocument();
  });

  it("shows architect view by default with overview tabs visible", () => {
    render(
      <ResultsPanel
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
        restorePercentage={20}
      />,
    );

    expect(screen.getByTestId("summary-cards")).toBeInTheDocument();
    expect(screen.getByTestId("comparison-chart")).toBeInTheDocument();
    expect(screen.queryByTestId("executive-summary")).not.toBeInTheDocument();
  });

  it("switches to executive view when Executive tab is clicked", () => {
    render(
      <ResultsPanel
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
        restorePercentage={20}
      />,
    );

    const executiveTab = screen.getByRole("tab", { name: "Executive" });
    fireEvent.mouseDown(executiveTab);
    fireEvent.click(executiveTab);

    expect(screen.getByTestId("executive-summary")).toBeInTheDocument();
    expect(screen.queryByTestId("summary-cards")).not.toBeInTheDocument();
    expect(screen.queryByTestId("comparison-chart")).not.toBeInTheDocument();
  });

  it("switches back to architect view when Architect tab is clicked", () => {
    render(
      <ResultsPanel
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
        restorePercentage={20}
      />,
    );

    const executiveTab = screen.getByRole("tab", { name: "Executive" });
    fireEvent.mouseDown(executiveTab);
    fireEvent.click(executiveTab);

    expect(screen.getByTestId("executive-summary")).toBeInTheDocument();

    const architectTab = screen.getByRole("tab", { name: "Architect" });
    fireEvent.mouseDown(architectTab);
    fireEvent.click(architectTab);

    expect(screen.getByTestId("summary-cards")).toBeInTheDocument();
    expect(screen.queryByTestId("executive-summary")).not.toBeInTheDocument();
  });

  it("hides overview, breakdown, and trend tabs in executive mode", () => {
    render(
      <ResultsPanel
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={3}
        restorePercentage={20}
      />,
    );

    const executiveTab = screen.getByRole("tab", { name: "Executive" });
    fireEvent.mouseDown(executiveTab);
    fireEvent.click(executiveTab);

    expect(
      screen.queryByRole("tab", { name: "Overview" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: "Breakdown" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /over time/i }),
    ).not.toBeInTheDocument();
  });
});
