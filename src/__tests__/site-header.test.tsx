import { fireEvent, render, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/layout/site-header";

function makeMockMq(matches: boolean) {
  return {
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

describe("SiteHeader", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(makeMockMq(false)));
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the application title, unofficial badge, and repository link inside a header", () => {
    const { container } = render(<SiteHeader />);

    const header = container.querySelector("header");
    expect(header).not.toBeNull();

    expect(
      within(header as HTMLElement).getByText("VDC Vault TCO Calculator"),
    ).toBeInTheDocument();
    expect(
      within(header as HTMLElement).getByText("Unofficial"),
    ).toBeInTheDocument();

    const repositoryLink = within(header as HTMLElement).getByRole("link", {
      name: /github repository/i,
    });

    expect(repositoryLink).toHaveAttribute(
      "href",
      "https://github.com/comnam90/vdc-vault-tco-calculator",
    );
    expect(repositoryLink).toHaveAttribute(
      "rel",
      expect.stringContaining("noopener"),
    );
  });

  it("renders the share button in the header", () => {
    const { container } = render(<SiteHeader />);
    const header = container.querySelector("header");
    expect(
      within(header as HTMLElement).getByRole("button", {
        name: /copy shareable link/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders the theme toggle button with a meaningful aria-label", () => {
    const { container } = render(<SiteHeader />);
    const header = container.querySelector("header");
    // Default state is "system", so label tells user they can switch to dark
    expect(
      within(header as HTMLElement).getByRole("button", {
        name: /switch to dark mode/i,
      }),
    ).toBeInTheDocument();
  });

  it("cycles the theme toggle label through system → dark → light → system", () => {
    const { container } = render(<SiteHeader />);
    const header = container.querySelector("header") as HTMLElement;

    const toggle = () =>
      within(header).getByRole("button", {
        name: /switch to dark mode|switch to light mode|follow system theme/i,
      });

    // system state: label = "Switch to dark mode"
    expect(toggle()).toHaveAttribute("aria-label", "Switch to dark mode");

    fireEvent.click(toggle());
    // dark state: label = "Switch to light mode"
    expect(toggle()).toHaveAttribute("aria-label", "Switch to light mode");

    fireEvent.click(toggle());
    // light state: label = "Follow system theme"
    expect(toggle()).toHaveAttribute("aria-label", "Follow system theme");

    fireEvent.click(toggle());
    // back to system
    expect(toggle()).toHaveAttribute("aria-label", "Switch to dark mode");
  });
});
