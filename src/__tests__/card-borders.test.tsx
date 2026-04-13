import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  FIXTURE_CAPACITY_TIB,
  FIXTURE_TERM_YEARS,
  fixtureComparison,
} from "@/__tests__/fixtures/comparison-result";
import { ResultsPanel } from "@/components/results/results-panel";

function collectClassTokens() {
  return Array.from(document.body.querySelectorAll("[class]")).flatMap((el) =>
    (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean),
  );
}

// Matches the large diffuse card shadows: shadow-[0_Npx_Npx_-Npx_color-mix(...)]
const diffuseShadowPattern = /^shadow-\[0_\d+px_\d+px_-\d+px_color-mix/;

describe("card borders", () => {
  it("renders card components without large diffuse shadows", () => {
    render(
      <ResultsPanel
        comparison={fixtureComparison}
        capacityTiB={FIXTURE_CAPACITY_TIB}
        termYears={FIXTURE_TERM_YEARS}
        restorePercentage={20}
      />,
    );

    const diffuseShadowTokens = collectClassTokens().filter((t) =>
      diffuseShadowPattern.test(t),
    );

    expect(diffuseShadowTokens).toEqual([]);
  });
});
