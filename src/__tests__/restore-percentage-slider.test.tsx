import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RestorePercentageSlider } from "@/components/calculator/restore-percentage-slider";

describe("RestorePercentageSlider", () => {
  it("renders a slider with role 'slider'", () => {
    render(
      <RestorePercentageSlider
        value={20}
        capacityTiB={0}
        onValueChange={() => undefined}
      />,
    );
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("has aria-label 'Annual restore percentage'", () => {
    render(
      <RestorePercentageSlider
        value={20}
        capacityTiB={0}
        onValueChange={() => undefined}
      />,
    );
    expect(
      screen.getByRole("slider", { name: /annual restore percentage/i }),
    ).toBeInTheDocument();
  });

  it("shows percentage only when capacityTiB is 0", () => {
    render(
      <RestorePercentageSlider
        value={20}
        capacityTiB={0}
        onValueChange={() => undefined}
      />,
    );
    expect(screen.getByText("20%")).toBeInTheDocument();
  });

  it("shows TiB equivalent when capacityTiB is set", () => {
    render(
      <RestorePercentageSlider
        value={20}
        capacityTiB={200}
        onValueChange={() => undefined}
      />,
    );
    expect(screen.getByText("40.0 TiB (20%)")).toBeInTheDocument();
  });

  it("TiB display has aria-live='polite'", () => {
    render(
      <RestorePercentageSlider
        value={20}
        capacityTiB={200}
        onValueChange={() => undefined}
      />,
    );
    const liveRegion = screen.getByText("40.0 TiB (20%)");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
  });

  it("does not show overage note when value is exactly 20", () => {
    render(
      <RestorePercentageSlider
        value={20}
        capacityTiB={100}
        onValueChange={() => undefined}
      />,
    );
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
  });

  it("does not show overage note when value is below 20", () => {
    render(
      <RestorePercentageSlider
        value={10}
        capacityTiB={100}
        onValueChange={() => undefined}
      />,
    );
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
  });

  it("shows overage note (role='note') when value is above 20", () => {
    render(
      <RestorePercentageSlider
        value={50}
        capacityTiB={100}
        onValueChange={() => undefined}
      />,
    );
    expect(screen.getByRole("note")).toBeInTheDocument();
  });

  it("overage note mentions infrequent-access rates", () => {
    render(
      <RestorePercentageSlider
        value={50}
        capacityTiB={100}
        onValueChange={() => undefined}
      />,
    );
    expect(screen.getByRole("note")).toHaveTextContent(/infrequent-access/i);
  });

  it("calls onValueChange with the new value on arrow key", () => {
    const handleChange = vi.fn();
    render(
      <RestorePercentageSlider
        value={20}
        capacityTiB={100}
        onValueChange={handleChange}
      />,
    );
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(handleChange).toHaveBeenCalledWith(21);
  });
});
