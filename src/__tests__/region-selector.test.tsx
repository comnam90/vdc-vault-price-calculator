import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RegionSelector } from "@/components/calculator/region-selector";
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
  {
    id: "azure-eastus2",
    name: "East US 2",
    provider: "Azure",
    coords: [36.7, -78.4],
    aliases: ["eastus2"],
    services: { vdc_vault: [{ edition: "Foundation", tier: "Core" }] },
  },
];

describe("RegionSelector", () => {
  it("shows a loading skeleton while regions are loading", () => {
    render(
      <RegionSelector
        isLoading
        onRegionChange={vi.fn()}
        regions={[]}
        selectedRegion={null}
      />,
    );

    expect(
      screen.getByRole("status", { name: /loading regions/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: /select a region/i }),
    ).not.toBeInTheDocument();
  });

  it("renders a searchable combobox grouped by provider and selects a region", () => {
    const onRegionChange = vi.fn();

    render(
      <RegionSelector
        isLoading={false}
        onRegionChange={onRegionChange}
        regions={regions}
        selectedRegion={null}
      />,
    );

    fireEvent.click(screen.getByRole("combobox", { name: /select a region/i }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByText("AWS").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Azure").length).toBeGreaterThan(0);

    const awsOption = screen.getByRole("option", {
      name: /us east \(n\. virginia\)/i,
    });
    expect(within(awsOption).getByText("AWS")).toBeInTheDocument();

    fireEvent.click(awsOption);

    expect(onRegionChange).toHaveBeenCalledWith(regions[0]);
  });

  it("filters regions by name and aliases and supports keyboard selection", () => {
    const onRegionChange = vi.fn();

    render(
      <RegionSelector
        isLoading={false}
        onRegionChange={onRegionChange}
        regions={regions}
        selectedRegion={null}
      />,
    );

    fireEvent.click(screen.getByRole("combobox", { name: /select a region/i }));

    const input = screen.getByPlaceholderText(/search regions or aliases/i);
    fireEvent.change(input, { target: { value: "eastus2" } });

    expect(
      screen.getByRole("option", { name: /east us 2/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /us east \(n\. virginia\)/i }),
    ).not.toBeInTheDocument();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onRegionChange).toHaveBeenCalledWith(regions[1]);
  });
});
