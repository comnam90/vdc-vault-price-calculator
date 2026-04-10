import { AlertTriangle, ExternalLink } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Region } from "@/types/region";

interface MissingCloudPricingAlertProps {
  region: Region;
}

const REPO = "https://github.com/comnam90/vdc-vault-tco-calculator";

export function MissingCloudPricingAlert({
  region,
}: MissingCloudPricingAlertProps) {
  const params = new URLSearchParams({
    title: `Missing cloud pricing: ${region.name} (${region.id})`,
    body: [
      `The region **${region.name}** (\`${region.id}\`, provider: ${region.provider}) is returned by the VDC Vault API but has no matching cloud pricing data in the calculator.`,
      ``,
      `Please add pricing data so the TCO comparison can be shown for this region.`,
    ].join("\n"),
    labels: "pricing-data",
  });
  const issueUrl = `${REPO}/issues/new?${params.toString()}`;

  return (
    <Alert variant="destructive">
      <AlertTriangle />
      <AlertTitle>Cloud pricing unavailable for {region.name}</AlertTitle>
      <AlertDescription>
        <p>
          We don&apos;t have public cloud pricing data for this region yet. The
          TCO comparison can&apos;t be shown until pricing is added.
        </p>
        <Button variant="outline" size="sm" asChild className="mt-3">
          <a href={issueUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink />
            Report missing region on GitHub
          </a>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
