import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Slider } from "@/components/ui/slider";

describe("Slider primitive", () => {
  it("renders without crashing", () => {
    render(<Slider value={[20]} onValueChange={() => undefined} />);
  });

  it("has a slider role", () => {
    render(<Slider value={[20]} onValueChange={() => undefined} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("has data-slot='slider' on the root", () => {
    const { container } = render(
      <Slider value={[20]} onValueChange={() => undefined} />,
    );
    expect(container.querySelector("[data-slot='slider']")).toBeInTheDocument();
  });

  it("has data-slot='slider-thumb' on the thumb", () => {
    const { container } = render(
      <Slider value={[20]} onValueChange={() => undefined} />,
    );
    expect(
      container.querySelector("[data-slot='slider-thumb']"),
    ).toBeInTheDocument();
  });
});
