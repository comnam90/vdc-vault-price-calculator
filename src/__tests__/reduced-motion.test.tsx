import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  FIXTURE_CAPACITY_TIB,
  FIXTURE_TERM_YEARS,
  fixtureComparison,
} from "@/__tests__/fixtures/comparison-result";
import { RegionSelector } from "@/components/calculator/region-selector";
import { ExecutiveSummary } from "@/components/results/executive-summary";
import { ResultsPanel } from "@/components/results/results-panel";
import type { Region } from "@/types/region";

const regions: Region[] = [
  {
    id: "aws-us-east-1",
    name: "US East (N. Virginia)",
    provider: "AWS",
    coords: [37.9, -77.4],
    aliases: ["us-east-1", "northern virginia"],
    services: { vdc_vault: [{ edition: "Foundation", tier: "Core" }] },
  },
];

const bareMotionClassPattern = /(^|:)(animate-|fade-|zoom-|slide-)/;

function collectClassTokens() {
  return Array.from(document.body.querySelectorAll("[class]")).flatMap(
    (element) =>
      (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean),
  );
}

describe("reduced motion", () => {
  it("keeps animation classes behind motion-safe prefixes", () => {
    render(
      <>
        <ResultsPanel
          comparison={fixtureComparison}
          capacityTiB={FIXTURE_CAPACITY_TIB}
          termYears={FIXTURE_TERM_YEARS}
          restorePercentage={20}
        />
        <ExecutiveSummary comparison={fixtureComparison} />
        <RegionSelector
          regions={[]}
          selectedRegion={null}
          isLoading
          onRegionChange={vi.fn()}
        />
        <RegionSelector
          regions={regions}
          selectedRegion={null}
          isLoading={false}
          onRegionChange={vi.fn()}
        />
      </>,
    );

    fireEvent.click(screen.getByRole("combobox", { name: /select a region/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    const classTokens = collectClassTokens();
    const bareMotionTokens = classTokens.filter(
      (token) =>
        bareMotionClassPattern.test(token) && !token.startsWith("motion-safe:"),
    );

    expect(classTokens).toContain("motion-safe:animate-pulse");
    expect(classTokens).toContain("motion-safe:animate-in");
    expect(bareMotionTokens).toEqual([]);
  });
});
