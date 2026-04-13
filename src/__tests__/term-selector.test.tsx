import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TermSelector } from "@/components/calculator/term-selector";

describe("TermSelector", () => {
  it("renders five radio options with 1 Year selected by default", () => {
    render(<TermSelector onTermChange={vi.fn()} />);

    const radios = screen.getAllByRole("radio");
    expect(
      screen.getByRole("radiogroup", { name: /commitment term/i }),
    ).toBeInTheDocument();
    expect(radios).toHaveLength(5);
    expect(screen.getByRole("radio", { name: "1 Year" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "5 Years" })).toBeInTheDocument();
  });

  it("uses gap-3 on the fieldset so the legend-to-radiogroup spacing matches other form field labels", () => {
    const { container } = render(<TermSelector onTermChange={vi.fn()} />);

    const fieldset = container.querySelector("fieldset");
    expect(fieldset?.className).toMatch(/gap-3/);
  });

  it("term buttons have no forced minimum width that causes the last button to expand full-width when wrapping", () => {
    render(<TermSelector onTermChange={vi.fn()} />);

    for (const button of screen.getAllByRole("radio")) {
      expect(button.className).not.toMatch(/min-w-\[calc\(50%/);
    }
  });

  it("allows term buttons to wrap at all viewport sizes (no forced md:flex-nowrap)", () => {
    render(<TermSelector onTermChange={vi.fn()} />);

    const radiogroup = screen.getByRole("radiogroup", {
      name: /commitment term/i,
    });
    expect(radiogroup.className).not.toMatch(/md:flex-nowrap/);
  });

  it("supports keyboard navigation with arrow keys and reports changes", () => {
    const onTermChange = vi.fn();
    render(<TermSelector onTermChange={onTermChange} />);

    const selected = screen.getByRole("radio", { name: "1 Year" });
    selected.focus();
    fireEvent.keyDown(selected, { key: "ArrowRight" });

    expect(onTermChange).toHaveBeenCalledWith(2);
  });
});
