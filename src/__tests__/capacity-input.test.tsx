import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CapacityInput } from "@/components/calculator/capacity-input";

describe("CapacityInput", () => {
  it("renders an associated label, TiB suffix, and numeric constraints", () => {
    render(<CapacityInput onCapacityChange={vi.fn()} value={0} />);

    const input = screen.getByLabelText(/protected capacity/i);
    expect(input).toHaveAttribute("min", "1");
    expect(input).toHaveAttribute("step", "1");
    expect(screen.getByText("TiB")).toBeInTheDocument();
  });

  it("emits numeric changes and ignores non-numeric input", () => {
    const onCapacityChange = vi.fn();
    render(<CapacityInput onCapacityChange={onCapacityChange} value={0} />);

    const input = screen.getByLabelText(/protected capacity/i);
    fireEvent.change(input, { target: { value: "12" } });
    fireEvent.change(input, { target: { value: "abc" } });

    expect(onCapacityChange).toHaveBeenCalledWith(12);
    expect(onCapacityChange).toHaveBeenCalledTimes(1);
  });
});
