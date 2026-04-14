import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/use-regions", () => ({
  useRegions: vi.fn(),
}));

vi.mock("@/hooks/use-url-state", () => ({
  useUrlState: vi.fn(),
}));

import App from "@/App";
import { useRegions } from "@/hooks/use-regions";
import { useUrlState } from "@/hooks/use-url-state";
import type { Region } from "@/types/region";

const regions: Region[] = [
  {
    id: "aws-us-east-1",
    name: "US East (N. Virginia)",
    provider: "AWS",
    coords: [37.9, -77.4],
    aliases: ["us-east-1"],
    services: {
      vdc_vault: [
        { edition: "Foundation", tier: "Core" },
        { edition: "Advanced", tier: "Core" },
      ],
    },
  },
];

const defaultUrlState = {
  urlDerivedInputs: {},
  urlKey: "",
  syncToUrl: vi.fn(),
};

describe("App", () => {
  beforeAll(async () => {
    // Pre-load the lazy ResultsPanel module so React.lazy resolves it as an
    // immediate microtask (synchronously flushable within act()) rather than
    // waiting for an async module load that may not complete within a single
    // act() flush when the full test suite runs under load.
    await import("@/components/results/results-panel");
  });

  beforeEach(() => {
    vi.mocked(useRegions).mockReset();
    vi.mocked(useUrlState).mockReturnValue({
      ...defaultUrlState,
      syncToUrl: vi.fn(),
    });
  });

  it("renders the header, calculator form, and footer while keeping results hidden initially", () => {
    vi.mocked(useRegions).mockReturnValue({
      regions,
      isLoading: false,
      error: null,
    });

    render(<App />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /vdc vault tco calculator/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("form", { name: /vault pricing inputs/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /comparison results/i }),
    ).not.toBeInTheDocument();
  });

  it("shows comparison results after the user selects a region, term, and capacity", async () => {
    vi.mocked(useRegions).mockReturnValue({
      regions,
      isLoading: false,
      error: null,
    });

    render(<App />);

    fireEvent.click(screen.getByRole("combobox", { name: /select a region/i }));
    fireEvent.click(
      screen.getByRole("option", { name: /us east \(n\. virginia\)/i }),
    );
    fireEvent.click(screen.getByRole("radio", { name: /3 years/i }));
    fireEvent.change(screen.getByLabelText(/required capacity/i), {
      target: { value: "8" },
    });

    expect(
      await screen.findByRole("region", { name: /comparison results/i }),
    ).toBeInTheDocument();
  }, 10_000);

  it("shows an app-level loading state while regions are still loading", () => {
    vi.mocked(useRegions).mockReturnValue({
      regions: [],
      isLoading: true,
      error: null,
    });

    render(<App />);

    expect(screen.getByText(/loading available regions/i)).toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: /loading regions/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /comparison results/i }),
    ).not.toBeInTheDocument();
  });

  it("shows a clear error state when regions fail to load", () => {
    vi.mocked(useRegions).mockReturnValue({
      regions: [],
      isLoading: false,
      error: "API unavailable",
    });

    render(<App />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/unable to load regions/i)).toBeInTheDocument();
    expect(screen.getByText(/api unavailable/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /comparison results/i }),
    ).not.toBeInTheDocument();
  });

  it("pre-populates the form and auto-shows results when URL has all three params", async () => {
    vi.mocked(useUrlState).mockReturnValue({
      urlDerivedInputs: {
        regionId: "aws-us-east-1",
        termYears: 3,
        capacityTiB: 8,
      },
      urlKey: "?region=aws-us-east-1&term=3&capacity=8",
      syncToUrl: vi.fn(),
    });
    vi.mocked(useRegions).mockReturnValue({
      regions,
      isLoading: false,
      error: null,
    });

    render(<App />);

    expect(
      await screen.findByRole("region", { name: /comparison results/i }),
    ).toBeInTheDocument();
  }, 10_000);

  it("shows a missing cloud pricing alert when the selected region has no pricing data", async () => {
    const unknownRegion: Region = {
      id: "aws-unknown-region-99",
      name: "Unknown Region",
      provider: "AWS",
      coords: [0, 0],
      aliases: [],
      services: {
        vdc_vault: [
          { edition: "Foundation", tier: "Core" },
          { edition: "Advanced", tier: "Core" },
        ],
      },
    };

    vi.mocked(useRegions).mockReturnValue({
      regions: [unknownRegion],
      isLoading: false,
      error: null,
    });

    render(<App />);

    fireEvent.click(screen.getByRole("combobox", { name: /select a region/i }));
    fireEvent.click(screen.getByRole("option", { name: /unknown region/i }));
    fireEvent.change(screen.getByLabelText(/required capacity/i), {
      target: { value: "8" },
    });

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(/cloud pricing unavailable for unknown region/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /comparison results/i }),
    ).not.toBeInTheDocument();
  }, 10_000);

  it("uses a flex-row split-pane layout container at lg breakpoint", () => {
    vi.mocked(useRegions).mockReturnValue({
      regions,
      isLoading: false,
      error: null,
    });

    render(<App />);

    const form = screen.getByRole("form", { name: /vault pricing inputs/i });
    expect(form.closest('[class*="lg:flex-row"]')).not.toBeNull();
  });

  it("places CalculatorForm in a sticky sidebar for the lg split-pane", () => {
    vi.mocked(useRegions).mockReturnValue({
      regions,
      isLoading: false,
      error: null,
    });

    render(<App />);

    const form = screen.getByRole("form", { name: /vault pricing inputs/i });
    expect(form.closest('[class*="lg:sticky"]')).not.toBeNull();
  });

  it("calls syncToUrl when the form fires onInputsChange", async () => {
    const syncToUrl = vi.fn();
    vi.mocked(useUrlState).mockReturnValue({
      ...defaultUrlState,
      syncToUrl,
    });
    vi.mocked(useRegions).mockReturnValue({
      regions,
      isLoading: false,
      error: null,
    });

    render(<App />);

    fireEvent.click(screen.getByRole("combobox", { name: /select a region/i }));
    fireEvent.click(
      screen.getByRole("option", { name: /us east \(n\. virginia\)/i }),
    );
    fireEvent.change(screen.getByLabelText(/required capacity/i), {
      target: { value: "8" },
    });

    await screen.findByRole("region", { name: /comparison results/i });

    expect(syncToUrl).toHaveBeenCalledWith({
      regionId: "aws-us-east-1",
      termYears: 1,
      capacityTiB: 8,
      excludeEgress: false,
      restorePercentage: 20,
    });
  }, 10_000);
});
