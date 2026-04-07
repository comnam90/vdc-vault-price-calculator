import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("shadcn/ui base components", () => {
  it("renders the button component", () => {
    render(<Button>Open calculator</Button>);

    expect(
      screen.getByRole("button", { name: "Open calculator" }),
    ).toBeInTheDocument();
  });
});
