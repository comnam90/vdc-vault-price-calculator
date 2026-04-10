import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fixtureComparison } from "@/__tests__/fixtures/comparison-result";
import { CostTrendChart } from "@/components/results/cost-trend-chart";

describe("CostTrendChart", () => {
  it("renders an accessible responsive line chart for a multi-year term", () => {
    const { container } = render(
      <CostTrendChart comparison={fixtureComparison} termYears={3} />,
    );

    expect(
      screen.getByRole("img", { name: /cumulative cost over 3 years/i }),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".recharts-responsive-container"),
    ).not.toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("shows legend labels for all available options", () => {
    render(<CostTrendChart comparison={fixtureComparison} termYears={3} />);

    expect(screen.getAllByText("VDC Vault Foundation").length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("VDC Vault Advanced").length).toBeGreaterThan(0);
    expect(screen.getAllByText("S3 Standard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("S3 Infrequent Access").length).toBeGreaterThan(
      0,
    );
  });

  it("omits legend label for unavailable vault foundation option", () => {
    render(
      <CostTrendChart
        comparison={{
          ...fixtureComparison,
          vaultFoundation: { total: null, perTbMonth: null, pricingTbd: false },
        }}
        termYears={3}
      />,
    );

    expect(screen.queryByText("VDC Vault Foundation")).not.toBeInTheDocument();
    expect(screen.getAllByText("VDC Vault Advanced").length).toBeGreaterThan(0);
  });

  it("omits legend label for TBD-priced vault advanced option", () => {
    render(
      <CostTrendChart
        comparison={{
          ...fixtureComparison,
          vaultAdvanced: { total: null, perTbMonth: null, pricingTbd: true },
        }}
        termYears={3}
      />,
    );

    expect(screen.queryByText("VDC Vault Advanced")).not.toBeInTheDocument();
    expect(screen.getAllByText("VDC Vault Foundation").length).toBeGreaterThan(
      0,
    );
  });

  it("omits legend label for unavailable DIY option 1", () => {
    render(
      <CostTrendChart
        comparison={{ ...fixtureComparison, diyOption1Unavailable: true }}
        termYears={3}
      />,
    );

    expect(screen.queryByText("S3 Standard")).not.toBeInTheDocument();
    expect(screen.getAllByText("S3 Infrequent Access").length).toBeGreaterThan(
      0,
    );
  });
});
