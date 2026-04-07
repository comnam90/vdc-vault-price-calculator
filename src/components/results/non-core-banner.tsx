import { CircleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ComparisonResult } from "@/types/calculator";

interface NonCoreBannerProps {
  comparison: ComparisonResult;
}

export function NonCoreBanner({ comparison }: NonCoreBannerProps) {
  if (
    !comparison.vaultFoundation.pricingTbd &&
    !comparison.vaultAdvanced.pricingTbd
  ) {
    return null;
  }

  return (
    <Alert
      variant="info"
      className="rounded-[1.5rem] px-5 py-4 shadow-[0_24px_72px_-48px_color-mix(in_oklab,var(--electric-azure)_55%,transparent)]"
    >
      <CircleAlert />
      <AlertTitle>Non-Core pricing pending</AlertTitle>
      <AlertDescription>
        <p>
          Non-Core pricing has not yet been announced for this region. Vault
          totals stay marked as TBD until Veeam publishes those rates.
        </p>
      </AlertDescription>
    </Alert>
  );
}
