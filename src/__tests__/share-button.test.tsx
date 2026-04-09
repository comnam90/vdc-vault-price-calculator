import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ShareButton } from "@/components/calculator/share-button";

function setLocationHref(href: string) {
  Object.defineProperty(window, "location", {
    writable: true,
    value: { ...window.location, href },
  });
}

describe("ShareButton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setLocationHref(
      "https://example.com/?region=aws-us-east-1&term=3&capacity=50",
    );
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders a button with accessible name 'Share'", () => {
    render(<ShareButton />);
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
  });

  it("calls navigator.clipboard.writeText with the current URL on click", async () => {
    render(<ShareButton />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /share/i }));
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "https://example.com/?region=aws-us-east-1&term=3&capacity=50",
    );
  });

  it("shows 'Copied!' after successful clipboard write", async () => {
    render(<ShareButton />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /share/i }));
    });
    expect(screen.getByText(/copied!/i)).toBeInTheDocument();
  });

  it("reverts label back to 'Share' after 2 seconds", async () => {
    render(<ShareButton />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /share/i }));
    });
    expect(screen.getByText(/copied!/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
    expect(screen.queryByText(/copied!/i)).not.toBeInTheDocument();
  });

  it("has no bare animation classes (motion-safe gated)", () => {
    const { container } = render(<ShareButton />);
    const allClasses = Array.from(container.querySelectorAll("*"))
      .flatMap((el) => Array.from(el.classList))
      .join(" ");

    const bareAnimations = /(?<!\S)(animate-|fade-|zoom-|slide-)[a-z]/g;
    const matches = allClasses.match(bareAnimations);
    expect(matches).toBeNull();
  });
});
