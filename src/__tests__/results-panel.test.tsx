import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  FIXTURE_CAPACITY_TIB,
  FIXTURE_TERM_YEARS,
  fixtureComparison,
} from "@/__tests__/fixtures/comparison-result";
import { ResultsPanel } from "@/components/results/results-panel";

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

  it("renders overview and breakdown tabs with the expected result components", async () => {
    render(
      <ResultsPanel
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
      />,
    );

    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Breakdown" })).toBeInTheDocument();
    expect(screen.getAllByText("VDC Vault Foundation").length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getByRole("img", { name: /comparison of vault and diy totals/i }),
    ).toBeInTheDocument();

    const breakdownTab = screen.getByRole("tab", { name: "Breakdown" });
    fireEvent.mouseDown(breakdownTab);
    fireEvent.click(breakdownTab);

    await waitFor(() => {
      expect(
        screen.getByRole("columnheader", { name: "Category" }),
      ).toBeInTheDocument();
    });

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
