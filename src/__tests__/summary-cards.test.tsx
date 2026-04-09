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
