import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Assumptions } from "@/components/results/assumptions";

describe("Assumptions", () => {
  it("renders a collapsible panel with calculator assumptions", () => {
    render(<Assumptions />);

    fireEvent.click(
      screen.getByRole("button", { name: /calculation assumptions/i }),
    );

    expect(screen.getByText(/1 MB operation size/i)).toBeInTheDocument();
    expect(screen.getByText(/20% annual read-back/i)).toBeInTheDocument();
    expect(screen.getByText(/20% annual egress/i)).toBeInTheDocument();
    expect(
      screen.getByText(/published VDC Vault Core pricing/i),
    ).toBeInTheDocument();
  });
});
