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

    expect(screen.getByText("VDC Vault Foundation")).toBeInTheDocument();
    expect(screen.getByText("VDC Vault Advanced")).toBeInTheDocument();
    expect(screen.getByText("S3 Standard")).toBeInTheDocument();
    expect(screen.getByText("S3 Infrequent Access")).toBeInTheDocument();

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

    expect(screen.queryByText("VDC Vault Foundation")).not.toBeInTheDocument();
    expect(screen.queryByText("VDC Vault Advanced")).not.toBeInTheDocument();
    expect(screen.getByText("S3 Standard")).toBeInTheDocument();
    expect(screen.getByText("S3 Infrequent Access")).toBeInTheDocument();
    expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(
      10,
    );
  });
});
