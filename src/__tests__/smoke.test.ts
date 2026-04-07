import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/use-regions", () => ({
  useRegions: vi.fn(() => ({
    regions: [],
    isLoading: false,
    error: null,
  })),
}));

describe("smoke", () => {
  it("renders the shell and calculator form", async () => {
    const mod = await import("@/App");
    const App = mod.default;

    render(createElement(App));

    expect(screen.getByText("VDC Vault Price Calculator")).toBeInTheDocument();
    expect(
      screen.getByRole("form", { name: /vault pricing inputs/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/not affiliated with veeam/i)).toBeInTheDocument();
  });
});
