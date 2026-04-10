import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Assumptions } from "@/components/results/assumptions";

describe("Assumptions", () => {
  it("renders a collapsible panel with calculator assumptions", () => {
    render(<Assumptions restorePercentage={20} />);

    fireEvent.click(
      screen.getByRole("button", { name: /calculation assumptions/i }),
    );

    expect(screen.getByText(/1 MB operation size/i)).toBeInTheDocument();
    expect(
      screen.getByText(/published VDC Vault Core pricing/i),
    ).toBeInTheDocument();
  });

  it("renders the restore percentage from prop", () => {
    render(<Assumptions restorePercentage={20} />);

    fireEvent.click(
      screen.getByRole("button", { name: /calculation assumptions/i }),
    );

    expect(screen.getByText(/20% annual restore/i)).toBeInTheDocument();
  });

  it("renders a custom restorePercentage", () => {
    render(<Assumptions restorePercentage={50} />);

    fireEvent.click(
      screen.getByRole("button", { name: /calculation assumptions/i }),
    );

    expect(screen.getByText(/50% annual restore/i)).toBeInTheDocument();
  });
});
