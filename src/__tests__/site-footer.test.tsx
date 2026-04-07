import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/layout/site-footer";

describe("SiteFooter", () => {
  it("renders disclaimer, data sources note, and build metadata inside a footer", () => {
    const { container } = render(<SiteFooter />);

    const footer = container.querySelector("footer");
    expect(footer).not.toBeNull();

    expect(
      within(footer as HTMLElement).getByText(/not affiliated with veeam/i),
    ).toBeInTheDocument();
    expect(
      within(footer as HTMLElement).getByText(/data sources/i),
    ).toBeInTheDocument();
    expect(
      within(footer as HTMLElement).getByText(__APP_VERSION__),
    ).toBeInTheDocument();
    expect(
      within(footer as HTMLElement).getByText(__APP_COMMIT__),
    ).toBeInTheDocument();
  });
});
