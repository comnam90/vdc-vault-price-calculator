import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fixtureComparison } from "@/__tests__/fixtures/comparison-result";
import { NonCoreBanner } from "@/components/results/non-core-banner";

describe("NonCoreBanner", () => {
  it("stays hidden when both vault editions have published pricing", () => {
    const { container } = render(
      <NonCoreBanner comparison={fixtureComparison} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders an alert when either vault edition still has non-core pricing TBD", () => {
    render(
      <NonCoreBanner
        comparison={{
          ...fixtureComparison,
          vaultAdvanced: {
            total: null,
            perTbMonth: null,
            pricingTbd: true,
          },
        }}
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(/non-core pricing has not yet been announced/i),
    ).toBeInTheDocument();
  });
});
