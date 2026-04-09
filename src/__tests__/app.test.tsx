import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
  initialValues: {},
  urlDerivedInputs: {},
  urlKey: "",
  syncToUrl: vi.fn(),
};

describe("App", () => {
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
      screen.getByRole("heading", { name: /vdc vault price calculator/i }),
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
    fireEvent.change(screen.getByLabelText(/protected capacity/i), {
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
      initialValues: {
        regionId: "aws-us-east-1",
        termYears: 3,
        capacityTiB: 8,
      },
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
    fireEvent.change(screen.getByLabelText(/protected capacity/i), {
      target: { value: "8" },
    });

    await screen.findByRole("region", { name: /comparison results/i });

    expect(syncToUrl).toHaveBeenCalledWith({
      regionId: "aws-us-east-1",
      termYears: 1,
      capacityTiB: 8,
    });
  }, 10_000);
});
