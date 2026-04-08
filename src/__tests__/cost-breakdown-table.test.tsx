import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fixtureComparison } from "@/__tests__/fixtures/comparison-result";
import { CostBreakdownTable } from "@/components/results/cost-breakdown-table";

describe("CostBreakdownTable", () => {
  it("renders headers, line items, vault placeholders, and a footer total row", () => {
    const { container } = render(
      <CostBreakdownTable comparison={fixtureComparison} />,
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("VDC Foundation")).toBeInTheDocument();
    expect(screen.getByText("VDC Advanced")).toBeInTheDocument();
    expect(screen.getByText("S3 Standard")).toBeInTheDocument();
    expect(screen.getByText("S3 Infrequent Access")).toBeInTheDocument();

    expect(screen.getByText("Storage")).toBeInTheDocument();
    expect(screen.getByText("Write Operations")).toBeInTheDocument();
    expect(screen.getByText("Read Operations")).toBeInTheDocument();
    expect(screen.getByText("Data Retrieval")).toBeInTheDocument();
    expect(screen.getByText("Internet Egress")).toBeInTheDocument();

    expect(screen.getAllByText("--")).toHaveLength(10);

    const footer = container.querySelector("tfoot");
    expect(footer).not.toBeNull();
    expect(
      within(footer as HTMLElement).getByText("Total"),
    ).toBeInTheDocument();
    expect(
      within(footer as HTMLElement).getByText("$5,040.00"),
    ).toBeInTheDocument();
    expect(
      within(footer as HTMLElement).getByText("$8,640.00"),
    ).toBeInTheDocument();
    expect(
      within(footer as HTMLElement).getByText("$9,000.00"),
    ).toBeInTheDocument();
    expect(
      within(footer as HTMLElement).getByText("$4,500.00"),
    ).toBeInTheDocument();
  });

  it("shows N/A and TBD in vault totals when editions are unavailable", () => {
    const { container } = render(
      <CostBreakdownTable
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

    const footer = container.querySelector("tfoot");

    expect(within(footer as HTMLElement).getByText("N/A")).toBeInTheDocument();
    expect(within(footer as HTMLElement).getByText("TBD")).toBeInTheDocument();
  });
});
