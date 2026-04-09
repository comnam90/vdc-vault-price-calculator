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

    // Storage row shows vault totals; remaining 4 rows × 2 vault columns = 8 dashes
    expect(screen.getAllByText("--")).toHaveLength(8);

    // Vault totals appear in both the Storage row and the footer
    expect(screen.getAllByText("$5,040.00").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("$8,640.00").length).toBeGreaterThanOrEqual(2);

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

  it("shows N/A for diyOption1 column when option1 unavailable", () => {
    const { container } = render(
      <CostBreakdownTable
        comparison={{
          ...fixtureComparison,
          diyOption1Label: "Cool Blob ZRS",
          diyOption1Unavailable: true,
        }}
      />,
    );

    const footer = container.querySelector("tfoot");

    // Column header still shows label
    expect(screen.getByText("Cool Blob ZRS")).toBeInTheDocument();

    // Footer total for unavailable column shows N/A (not a dollar amount)
    const naInFooter = within(footer as HTMLElement).getAllByText("N/A");
    expect(naInFooter.length).toBeGreaterThanOrEqual(1);
  });

  it("shows 'Internet Egress (excluded)' when excludeEgress is true", () => {
    render(
      <CostBreakdownTable
        comparison={{
          ...fixtureComparison,
          diyOption1: { ...fixtureComparison.diyOption1, internetEgress: 0 },
          diyOption2: { ...fixtureComparison.diyOption2, internetEgress: 0 },
        }}
        excludeEgress={true}
      />,
    );
    expect(screen.getByText("Internet Egress (excluded)")).toBeInTheDocument();
    expect(screen.queryByText("Internet Egress")).not.toBeInTheDocument();
  });

  it("shows 'Internet Egress' (no suffix) when excludeEgress is false", () => {
    render(
      <CostBreakdownTable
        comparison={fixtureComparison}
        excludeEgress={false}
      />,
    );
    expect(screen.getByText("Internet Egress")).toBeInTheDocument();
  });

  it("shows 'Internet Egress' when excludeEgress is omitted", () => {
    render(<CostBreakdownTable comparison={fixtureComparison} />);
    expect(screen.getByText("Internet Egress")).toBeInTheDocument();
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
