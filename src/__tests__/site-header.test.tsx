import { render, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/layout/site-header";

describe("SiteHeader", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
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
});
