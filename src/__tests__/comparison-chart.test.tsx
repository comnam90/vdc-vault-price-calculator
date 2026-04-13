import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fixtureComparison } from "@/__tests__/fixtures/comparison-result";
import {
  ChartTooltip,
  ComparisonChart,
} from "@/components/results/comparison-chart";

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
    expect(screen.getAllByText(/S3 Infrequent/i).length).toBeGreaterThan(0);

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
    expect(screen.getAllByText(/S3 Infrequent/i).length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(
      10,
    );
  });
});

describe("ChartTooltip percentage display", () => {
  // Fixture mirrors diyOption1 from fixtureComparison: total = 9000
  const diyPayload = [
    { name: "Storage", value: 7200, fill: "#aaa" },
    { name: "Write Operations", value: 900, fill: "#bbb" },
    { name: "Read Operations", value: 300, fill: "#ccc" },
    { name: "Data Retrieval", value: 200, fill: "#ddd" },
    { name: "Internet Egress", value: 400, fill: "#eee" },
  ];

  it("shows rounded integer percentage suffix on each DIY tooltip row", () => {
    render(<ChartTooltip active label="S3 Standard" payload={diyPayload} />);
    // 7200/9000=80%, 900/9000=10%, 300/9000=3%, 200/9000=2%, 400/9000=4%
    expect(screen.getByText("(80%)")).toBeInTheDocument();
    expect(screen.getByText("(10%)")).toBeInTheDocument();
    expect(screen.getByText("(3%)")).toBeInTheDocument();
    expect(screen.getByText("(2%)")).toBeInTheDocument();
    expect(screen.getByText("(4%)")).toBeInTheDocument();
  });

  it("omits percentage suffix for single-segment Vault tooltip rows", () => {
    render(
      <ChartTooltip
        active
        label="VDC Vault Foundation"
        payload={[{ name: "VDC Vault Foundation", value: 5040, fill: "#0f0" }]}
      />,
    );
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});
