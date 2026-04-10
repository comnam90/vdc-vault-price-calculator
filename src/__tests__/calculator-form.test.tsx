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
    fireEvent.change(screen.getByLabelText(/required capacity/i), {
      target: { value: "8" },
    });

    await waitFor(() => {
      expect(onInputsChange).toHaveBeenLastCalledWith({
        regionId: "aws-us-east-1",
        termYears: 1,
        capacityTiB: 8,
        excludeEgress: false,
        restorePercentage: 20,
      });
    });

    fireEvent.click(screen.getByRole("radio", { name: "3 Years" }));

    await waitFor(() => {
      expect(onInputsChange).toHaveBeenLastCalledWith({
        regionId: "aws-us-east-1",
        termYears: 3,
        capacityTiB: 8,
        excludeEgress: false,
        restorePercentage: 20,
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
    const capacityInput = screen.getByLabelText(/required capacity/i);
    fireEvent.change(capacityInput, {
      target: { value: "8" },
    });

    await waitFor(() => {
      expect(onInputsChange).toHaveBeenLastCalledWith({
        regionId: "aws-us-east-1",
        termYears: 1,
        capacityTiB: 8,
        excludeEgress: false,
        restorePercentage: 20,
      });
    });

    fireEvent.change(capacityInput, {
      target: { value: "" },
    });

    await waitFor(() => {
      expect(onInputsChange).toHaveBeenLastCalledWith(null);
    });
  });

  it("pressing Enter in the capacity input does not clear inputs", async () => {
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
    const capacityInput = screen.getByLabelText(/required capacity/i);
    fireEvent.change(capacityInput, { target: { value: "8" } });

    await waitFor(() => {
      expect(onInputsChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ capacityTiB: 8 }),
      );
    });

    // Simulate Enter in the capacity input
    fireEvent.keyDown(capacityInput, { key: "Enter", code: "Enter" });
    fireEvent.submit(capacityInput.closest("form")!);

    // Inputs must remain populated — no reset
    await waitFor(() => {
      expect(onInputsChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ capacityTiB: 8 }),
      );
    });
    expect(capacityInput).toHaveValue(8);
  });

  it("avoids the rigid custom lg grid that causes laptop-width overlap", () => {
    vi.mocked(useRegions).mockReturnValue({
      regions,
      isLoading: false,
      error: null,
    });

    render(<CalculatorForm onInputsChange={vi.fn()} />);

    const form = screen.getByRole("form", { name: /vault pricing inputs/i });
    expect(form.className).not.toMatch(/lg:grid-cols-\[/);
  });

  describe("EgressToggle integration", () => {
    it("renders the egress toggle in the form", () => {
      vi.mocked(useRegions).mockReturnValue({
        regions,
        isLoading: false,
        error: null,
      });
      render(<CalculatorForm onInputsChange={vi.fn()} />);
      expect(screen.getByRole("switch")).toBeInTheDocument();
    });

    it("toggle is off by default", () => {
      vi.mocked(useRegions).mockReturnValue({
        regions,
        isLoading: false,
        error: null,
      });
      render(<CalculatorForm onInputsChange={vi.fn()} />);
      expect(screen.getByRole("switch")).toHaveAttribute(
        "aria-checked",
        "false",
      );
    });

    it("includes excludeEgress: true in inputs when toggle is on", async () => {
      const onInputsChange = vi.fn();
      vi.mocked(useRegions).mockReturnValue({
        regions,
        isLoading: false,
        error: null,
      });
      render(<CalculatorForm onInputsChange={onInputsChange} />);

      fireEvent.click(
        screen.getByRole("combobox", { name: /select a region/i }),
      );
      fireEvent.click(
        screen.getByRole("option", { name: /us east \(n\. virginia\)/i }),
      );
      fireEvent.change(screen.getByLabelText(/required capacity/i), {
        target: { value: "8" },
      });
      fireEvent.click(screen.getByRole("switch"));

      await waitFor(() => {
        expect(onInputsChange).toHaveBeenLastCalledWith(
          expect.objectContaining({ excludeEgress: true }),
        );
      });
    });

    it("pre-populates excludeEgress: true from initialValues", () => {
      vi.mocked(useRegions).mockReturnValue({
        regions,
        isLoading: false,
        error: null,
      });
      render(
        <CalculatorForm
          onInputsChange={vi.fn()}
          initialValues={{ excludeEgress: true }}
        />,
      );
      expect(screen.getByRole("switch")).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });
  });

  describe("initialValues pre-population", () => {
    it("pre-fills term and capacity from initialValues", () => {
      vi.mocked(useRegions).mockReturnValue({
        regions,
        isLoading: false,
        error: null,
      });

      render(
        <CalculatorForm
          onInputsChange={vi.fn()}
          initialValues={{ termYears: 3, capacityTiB: 42 }}
        />,
      );

      expect(screen.getByRole("radio", { name: "3 Years" })).toBeChecked();
      expect(screen.getByLabelText(/required capacity/i)).toHaveValue(42);
    });

    it("auto-selects the region matching initialValues.regionId after regions load", async () => {
      vi.mocked(useRegions).mockReturnValue({
        regions,
        isLoading: false,
        error: null,
      });

      render(
        <CalculatorForm
          onInputsChange={vi.fn()}
          initialValues={{ regionId: "aws-us-east-1" }}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole("combobox", { name: /select a region/i }),
        ).toHaveTextContent(/us east.*virginia/i);
      });
    });

    it("leaves the region selector empty for an unknown regionId", async () => {
      vi.mocked(useRegions).mockReturnValue({
        regions,
        isLoading: false,
        error: null,
      });

      render(
        <CalculatorForm
          onInputsChange={vi.fn()}
          initialValues={{ regionId: "aws-unknown-region" }}
        />,
      );

      // No match means selector stays in its placeholder state
      expect(
        screen.getByRole("combobox", { name: /select a region/i }),
      ).not.toHaveTextContent(/virginia/i);
    });

    it("uses defaults for fields absent from initialValues", () => {
      vi.mocked(useRegions).mockReturnValue({
        regions,
        isLoading: false,
        error: null,
      });

      render(
        <CalculatorForm
          onInputsChange={vi.fn()}
          initialValues={{ termYears: 5 }}
        />,
      );

      expect(screen.getByRole("radio", { name: "5 Years" })).toBeChecked();
      // CapacityInput shows "" (null value) when capacityTiB is 0
      expect(screen.getByLabelText(/required capacity/i)).toHaveValue(null);
    });
  });

  describe("RestorePercentageSlider integration", () => {
    it("renders the restore percentage slider in the form", () => {
      vi.mocked(useRegions).mockReturnValue({
        regions,
        isLoading: false,
        error: null,
      });
      render(<CalculatorForm onInputsChange={vi.fn()} />);
      expect(
        screen.getByRole("slider", { name: /annual restore percentage/i }),
      ).toBeInTheDocument();
    });

    it("slider defaults to 20 (percent)", () => {
      vi.mocked(useRegions).mockReturnValue({
        regions,
        isLoading: false,
        error: null,
      });
      render(<CalculatorForm onInputsChange={vi.fn()} />);
      expect(
        screen.getByRole("slider", { name: /annual restore percentage/i }),
      ).toHaveAttribute("aria-valuenow", "20");
    });

    it("pre-populates restorePercentage from initialValues", () => {
      vi.mocked(useRegions).mockReturnValue({
        regions,
        isLoading: false,
        error: null,
      });
      render(
        <CalculatorForm
          onInputsChange={vi.fn()}
          initialValues={{ restorePercentage: 50 }}
        />,
      );
      expect(
        screen.getByRole("slider", { name: /annual restore percentage/i }),
      ).toHaveAttribute("aria-valuenow", "50");
    });

    it("includes restorePercentage in onInputsChange when slider moves", async () => {
      const onInputsChange = vi.fn();
      vi.mocked(useRegions).mockReturnValue({
        regions,
        isLoading: false,
        error: null,
      });
      render(<CalculatorForm onInputsChange={onInputsChange} />);

      // Fill in required inputs first
      fireEvent.click(
        screen.getByRole("combobox", { name: /select a region/i }),
      );
      fireEvent.click(
        screen.getByRole("option", { name: /us east \(n\. virginia\)/i }),
      );
      fireEvent.change(screen.getByLabelText(/required capacity/i), {
        target: { value: "10" },
      });

      // Advance slider
      const slider = screen.getByRole("slider", {
        name: /annual restore percentage/i,
      });
      fireEvent.keyDown(slider, { key: "ArrowRight" });

      await waitFor(() => {
        expect(onInputsChange).toHaveBeenLastCalledWith(
          expect.objectContaining({ restorePercentage: 21 }),
        );
      });
    });
  });
});
