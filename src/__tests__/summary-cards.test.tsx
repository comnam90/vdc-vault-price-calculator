import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  FIXTURE_CAPACITY_TIB,
  FIXTURE_TERM_YEARS,
  fixtureComparison,
} from "@/__tests__/fixtures/comparison-result";
import { SummaryCards } from "@/components/results/summary-cards";

describe("SummaryCards", () => {
  it("renders four cards with formatted totals, monthly rates, and a cheapest highlight", () => {
    render(
      <SummaryCards
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
      />,
    );

    expect(screen.getByText("VDC Vault Foundation")).toBeInTheDocument();
    expect(screen.getByText("VDC Vault Advanced")).toBeInTheDocument();
    expect(screen.getByText("S3 Standard")).toBeInTheDocument();
    expect(screen.getByText("S3 Infrequent Access")).toBeInTheDocument();

    expect(screen.getByText("$5,040.00")).toBeInTheDocument();
    expect(screen.getByText("$8,640.00")).toBeInTheDocument();
    expect(screen.getByText("$9,000.00")).toBeInTheDocument();
    expect(screen.getByText("$4,500.00")).toBeInTheDocument();

    expect(screen.getByText("$14/TB/mo")).toBeInTheDocument();
    expect(screen.getByText("$24/TB/mo")).toBeInTheDocument();
    expect(screen.getByText("$25/TB/mo")).toBeInTheDocument();
    expect(screen.getByText("$12.5/TB/mo")).toBeInTheDocument();

    const cheapestCard = screen
      .getByText("S3 Infrequent Access")
      .closest('[data-slot="card"]');

    expect(cheapestCard).toHaveClass("bg-card-tint-success");
  });

  it("shows Pricing TBD and N/A when vault pricing is unavailable", () => {
    render(
      <SummaryCards
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
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
      />,
    );

    const foundationCard = screen
      .getByText("VDC Vault Foundation")
      .closest('[data-slot="card"]');
    const advancedCard = screen
      .getByText("VDC Vault Advanced")
      .closest('[data-slot="card"]');

    expect(
      within(foundationCard as HTMLElement).getAllByText("N/A"),
    ).toHaveLength(2);
    expect(
      within(advancedCard as HTMLElement).getByText("Pricing TBD"),
    ).toBeInTheDocument();
    expect(
      within(advancedCard as HTMLElement).getByText("TBD"),
    ).toBeInTheDocument();
  });

  it("uses derived effective rate for Foundation when overage is present", () => {
    // total = 5040 + 1260 overage = 6300
    // derived rate = 6300 / (10 TiB * 3 years * 12 months) = $17.50/TB/mo
    render(
      <SummaryCards
        comparison={{
          ...fixtureComparison,
          vaultFoundation: {
            ...fixtureComparison.vaultFoundation,
            total: 6300,
            overage: 1260,
          },
        }}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
      />,
    );

    const foundationCard = screen
      .getByText("VDC Vault Foundation")
      .closest('[data-slot="card"]');

    // Should show derived rate, not the fixed $14/TB/mo
    expect(
      within(foundationCard as HTMLElement).getByText("$17.5/TB/mo"),
    ).toBeInTheDocument();
    expect(
      within(foundationCard as HTMLElement).queryByText("$14/TB/mo"),
    ).not.toBeInTheDocument();
  });

  it("uses perTbMonth for Foundation rate when no overage", () => {
    render(
      <SummaryCards
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
      />,
    );

    const foundationCard = screen
      .getByText("VDC Vault Foundation")
      .closest('[data-slot="card"]');

    expect(
      within(foundationCard as HTMLElement).getByText("$14/TB/mo"),
    ).toBeInTheDocument();
  });

  it("renders the Lowest total badge on its own line, not inline with the card title", () => {
    render(
      <SummaryCards
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
      />,
    );

    const badge = screen.getByText("Lowest total");
    expect(badge.closest('[class*="justify-between"]')).toBeNull();
  });

  it("uses xl (not lg) breakpoint for 4-column layout to avoid overflow inside the split-pane right pane", () => {
    render(
      <SummaryCards
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
      />,
    );

    const grid = screen
      .getByText("VDC Vault Foundation")
      .closest('[data-slot="card"]')?.parentElement;

    expect(grid?.className).not.toMatch(/lg:grid-cols-4/);
    expect(grid?.className).toMatch(/xl:grid-cols-4/);
  });

  it("shows ZRS not available text and excludes it from cheapest when option1 unavailable", () => {
    render(
      <SummaryCards
        comparison={{
          ...fixtureComparison,
          diyOption1Label: "Cool Blob ZRS",
          diyOption1Unavailable: true,
        }}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
      />,
    );

    const zrsCard = screen
      .getByText("Cool Blob ZRS")
      .closest('[data-slot="card"]');

    expect(
      within(zrsCard as HTMLElement).getByText("ZRS not available"),
    ).toBeInTheDocument();

    // diyOption2 ($4,500) should be cheapest, not the unavailable option1
    expect(screen.getByText("Lowest total")).toBeInTheDocument();
    const cheapestCard = screen
      .getByText("S3 Infrequent Access")
      .closest('[data-slot="card"]');
    expect(cheapestCard).toHaveClass("bg-card-tint-success");
  });
});
