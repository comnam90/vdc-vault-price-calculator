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

  it("does not cause a render loop when comparison prop changes (term change regression)", () => {
    const { rerender } = render(
      <CostBreakdownTable comparison={fixtureComparison} />,
    );
    const updatedComparison = {
      ...fixtureComparison,
      vaultFoundation: { ...fixtureComparison.vaultFoundation, total: 9999 },
    };
    rerender(<CostBreakdownTable comparison={updatedComparison} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
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

  it("does not show an overage row when vaultFoundation.overage is undefined", () => {
    render(<CostBreakdownTable comparison={fixtureComparison} />);
    expect(screen.queryByText(/restore overage/i)).not.toBeInTheDocument();
  });

  it("does not show an overage row when vaultFoundation.overage is 0", () => {
    render(
      <CostBreakdownTable
        comparison={{
          ...fixtureComparison,
          vaultFoundation: { ...fixtureComparison.vaultFoundation, overage: 0 },
        }}
      />,
    );
    expect(screen.queryByText(/restore overage/i)).not.toBeInTheDocument();
  });

  it("shows 'Restore Overage (> 20%)' row when vaultFoundation.overage > 0", () => {
    render(
      <CostBreakdownTable
        comparison={{
          ...fixtureComparison,
          vaultFoundation: {
            ...fixtureComparison.vaultFoundation,
            overage: 317.5,
          },
        }}
      />,
    );
    expect(screen.getByText("Restore Overage (> 20%)")).toBeInTheDocument();
    expect(screen.getByText("$317.50")).toBeInTheDocument();
  });

  it("storage row shows base cost (total minus overage) when overage is present", () => {
    // total = 5040 base + 317.5 overage = 5357.5
    // Storage row should show $5,040.00 (base only); footer Total shows $5,357.50
    const { container } = render(
      <CostBreakdownTable
        comparison={{
          ...fixtureComparison,
          vaultFoundation: {
            ...fixtureComparison.vaultFoundation,
            total: 5357.5,
            overage: 317.5,
          },
        }}
      />,
    );

    const footer = container.querySelector("tfoot");
    const tbody = container.querySelector("tbody");

    // Storage row in tbody shows base cost
    const storageRow = Array.from(
      (tbody as HTMLElement).querySelectorAll("tr"),
    ).find((row) => row.textContent?.includes("Storage"));
    expect(storageRow).toBeTruthy();
    expect(
      within(storageRow as HTMLElement).getByText("$5,040.00"),
    ).toBeInTheDocument();
    expect(
      within(storageRow as HTMLElement).queryByText("$5,357.50"),
    ).not.toBeInTheDocument();

    // Footer shows full total including overage
    expect(
      within(footer as HTMLElement).getByText("$5,357.50"),
    ).toBeInTheDocument();
  });

  it("applies font-mono to non-category data cells", () => {
    render(<CostBreakdownTable comparison={fixtureComparison} />);

    // $5,040.00 appears in both the Storage body row and the footer Total row
    const cells = screen.getAllByText("$5,040.00");
    cells.forEach((cell) => expect(cell).toHaveClass("font-mono"));
  });

  it("overage row shows '--' for Advanced and DIY columns", () => {
    render(
      <CostBreakdownTable
        comparison={{
          ...fixtureComparison,
          vaultFoundation: {
            ...fixtureComparison.vaultFoundation,
            overage: 317.5,
          },
        }}
      />,
    );
    // With overage row: 4 existing dash rows + 3 new dashes in overage row (Advanced + 2 DIY)
    // Original 8 dashes + 3 = 11 total
    expect(screen.getAllByText("--").length).toBeGreaterThan(8);
  });
});
