import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/use-regions", () => ({
  useRegions: vi.fn(),
}));

import App from "@/App";
import { useRegions } from "@/hooks/use-regions";
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

describe("App", () => {
  beforeEach(() => {
    vi.mocked(useRegions).mockReset();
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
});
