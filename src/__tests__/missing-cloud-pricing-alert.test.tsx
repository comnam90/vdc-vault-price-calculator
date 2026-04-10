import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MissingCloudPricingAlert } from "@/components/results/missing-cloud-pricing-alert";
import type { Region } from "@/types/region";

const mockRegion: Region = {
  id: "aws-ap-southeast-99",
  name: "Asia Pacific (Fictional)",
  provider: "AWS",
  coords: [1.35, 103.82],
  aliases: ["ap-southeast-99"],
  services: {
    vdc_vault: [
      { edition: "Foundation", tier: "Core" },
      { edition: "Advanced", tier: "Core" },
    ],
  },
};

describe("MissingCloudPricingAlert", () => {
  it("renders an alert with the region name in the title", () => {
    render(<MissingCloudPricingAlert region={mockRegion} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(
        /cloud pricing unavailable for asia pacific \(fictional\)/i,
      ),
    ).toBeInTheDocument();
  });

  it("explains that the TCO comparison cannot be shown", () => {
    render(<MissingCloudPricingAlert region={mockRegion} />);

    expect(
      screen.getByText(/tco comparison can't be shown/i),
    ).toBeInTheDocument();
  });

  it("renders a link that opens a pre-filled GitHub issue", () => {
    render(<MissingCloudPricingAlert region={mockRegion} />);

    const link = screen.getByRole("link", {
      name: /report missing region on github/i,
    });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    const href = link.getAttribute("href") ?? "";
    expect(href).toContain(
      "github.com/comnam90/vdc-vault-tco-calculator/issues/new",
    );
    // Decode the URL for readable assertions (URLSearchParams uses + for spaces)
    const decodedHref = decodeURIComponent(href.replace(/\+/g, " "));
    expect(decodedHref).toContain("aws-ap-southeast-99");
    expect(decodedHref).toContain("Asia Pacific (Fictional)");
  });
});
