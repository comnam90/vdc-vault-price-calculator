import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CalculatorForm } from "@/components/calculator/calculator-form";
import type { Region } from "@/types/region";

vi.mock("@/hooks/use-regions", () => ({
  useRegions: vi.fn(),
}));

import { useRegions } from "@/hooks/use-regions";

const regions: Region[] = [
  {
    id: "aws-us-east-1",
    name: "US East (N. Virginia)",
    provider: "AWS",
    coords: [37.9, -77.4],
    aliases: ["us-east-1"],
    services: { vdc_vault: [{ edition: "Foundation", tier: "Core" }] },
  },
];

describe("CalculatorForm", () => {
  it("shows the region selector loading state while regions load", () => {
    vi.mocked(useRegions).mockReturnValue({
      regions: [],
      isLoading: true,
      error: null,
    });

    render(<CalculatorForm onInputsChange={vi.fn()} />);

    expect(
      screen.getByRole("form", { name: /vault pricing inputs/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: /loading regions/i }),
    ).toBeInTheDocument();
  });

  it("renders all inputs and notifies parent once all values are populated", async () => {
    const onInputsChange = vi.fn();
    vi.mocked(useRegions).mockReturnValue({
      regions,
      isLoading: false,
      error: null,
    });

    render(<CalculatorForm onInputsChange={onInputsChange} />);

    fireEvent.click(screen.getByRole("combobox", { name: /select a region/i }));
    fireEvent.click(
      screen.getByRole("option", { name: /us east \(n\. virginia\)/i }),
    );
    fireEvent.change(screen.getByLabelText(/protected capacity/i), {
      target: { value: "8" },
    });

    await waitFor(() => {
      expect(onInputsChange).toHaveBeenLastCalledWith({
        regionId: "aws-us-east-1",
        termYears: 1,
        capacityTiB: 8,
      });
    });

    fireEvent.click(screen.getByRole("radio", { name: "3 Years" }));

    await waitFor(() => {
      expect(onInputsChange).toHaveBeenLastCalledWith({
        regionId: "aws-us-east-1",
        termYears: 3,
        capacityTiB: 8,
      });
    });
  });

  it("clears the parent state when inputs become incomplete again", async () => {
    const onInputsChange = vi.fn();
    vi.mocked(useRegions).mockReturnValue({
      regions,
      isLoading: false,
      error: null,
    });

    render(<CalculatorForm onInputsChange={onInputsChange} />);

    fireEvent.click(screen.getByRole("combobox", { name: /select a region/i }));
    fireEvent.click(
      screen.getByRole("option", { name: /us east \(n\. virginia\)/i }),
    );
    const capacityInput = screen.getByLabelText(/protected capacity/i);
    fireEvent.change(capacityInput, {
      target: { value: "8" },
    });

    await waitFor(() => {
      expect(onInputsChange).toHaveBeenLastCalledWith({
        regionId: "aws-us-east-1",
        termYears: 1,
        capacityTiB: 8,
      });
    });

    fireEvent.change(capacityInput, {
      target: { value: "" },
    });

    await waitFor(() => {
      expect(onInputsChange).toHaveBeenLastCalledWith(null);
    });
  });
});
