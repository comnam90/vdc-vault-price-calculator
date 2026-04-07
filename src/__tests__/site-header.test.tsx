import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "@/components/layout/site-header";

describe("SiteHeader", () => {
  it("renders the application title, unofficial badge, and repository link inside a header", () => {
    const { container } = render(<SiteHeader />);

    const header = container.querySelector("header");
    expect(header).not.toBeNull();

    expect(
      within(header as HTMLElement).getByText("VDC Vault Price Calculator"),
    ).toBeInTheDocument();
    expect(
      within(header as HTMLElement).getByText("Unofficial"),
    ).toBeInTheDocument();

    const repositoryLink = within(header as HTMLElement).getByRole("link", {
      name: /github repository/i,
    });

    expect(repositoryLink).toHaveAttribute(
      "href",
      "https://github.com/comnam90/vdc-vault-price-calculator",
    );
    expect(repositoryLink).toHaveAttribute(
      "rel",
      expect.stringContaining("noopener"),
    );
  });
});
