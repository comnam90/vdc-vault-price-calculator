import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fixtureComparison } from "@/__tests__/fixtures/comparison-result";
import { ComparisonChart } from "@/components/results/comparison-chart";

describe("ComparisonChart", () => {
  it("renders an accessible responsive bar chart with four comparison labels", () => {
    const { container } = render(
      <ComparisonChart comparison={fixtureComparison} />,
    );

    expect(
      screen.getByRole("img", { name: /comparison of vault and diy totals/i }),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".recharts-responsive-container"),
    ).not.toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();

    expect(screen.getAllByText("VDC Vault Foundation").length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("VDC Vault Advanced").length).toBeGreaterThan(0);
    expect(screen.getAllByText("S3 Standard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("S3 Infrequent Access").length).toBeGreaterThan(
      0,
    );

    expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(
      12,
    );
  });

  it("omits unavailable vault bars while preserving both DIY stacks", () => {
    const { container } = render(
      <ComparisonChart
        comparison={{
          ...fixtureComparison,
          vaultFoundation: {
            total: null,
            perTbMonth: null,
            pricingTbd: false,
          },
          vaultAdvanced: {
            total: null,
            perTbMonth: null,
            pricingTbd: true,
          },
        }}
      />,
    );

    // Legend always renders all series names; verify by bar count instead
    expect(screen.getAllByText("S3 Standard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("S3 Infrequent Access").length).toBeGreaterThan(
      0,
    );
    expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(
      10,
    );
  });
});
