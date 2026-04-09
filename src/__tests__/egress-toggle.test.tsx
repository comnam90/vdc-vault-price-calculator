import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EgressToggle } from "@/components/calculator/egress-toggle";

describe("EgressToggle", () => {
  it("renders a switch with role 'switch'", () => {
    render(<EgressToggle checked={false} onCheckedChange={vi.fn()} />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("is unchecked when checked=false", () => {
    render(<EgressToggle checked={false} onCheckedChange={vi.fn()} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("is checked when checked=true", () => {
    render(<EgressToggle checked={true} onCheckedChange={vi.fn()} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("calls onCheckedChange with true when toggled from off", () => {
    const onCheckedChange = vi.fn();
    render(<EgressToggle checked={false} onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("calls onCheckedChange with false when toggled from on", () => {
    const onCheckedChange = vi.fn();
    render(<EgressToggle checked={true} onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it("has an accessible label linked to the switch", () => {
    render(<EgressToggle checked={false} onCheckedChange={vi.fn()} />);
    const label = screen.getByText(/exclude internet egress/i);
    expect(label).toBeInTheDocument();
    expect(label.tagName.toLowerCase()).toBe("label");
  });

  it("has a visible description text", () => {
    render(<EgressToggle checked={false} onCheckedChange={vi.fn()} />);
    expect(
      screen.getByText(/expressroute or directconnect/i),
    ).toBeInTheDocument();
  });

  it("has no bare animation classes (motion-safe required)", () => {
    const { container } = render(
      <EgressToggle checked={false} onCheckedChange={vi.fn()} />,
    );
    const allClasses = Array.from(container.querySelectorAll("*"))
      .flatMap((el) => Array.from(el.classList))
      .join(" ");
    const bareAnimations = /(?<!\S)(animate-|fade-|zoom-|slide-)[a-z]/g;
    expect(allClasses.match(bareAnimations)).toBeNull();
  });
});
