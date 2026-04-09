import { useCallback, useMemo, useState } from "react";

import { CalculatorForm } from "@/components/calculator/calculator-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ResultsPanel } from "@/components/results/results-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CLOUD_PRICING } from "@/data/cloud-pricing";
import { useRegions } from "@/hooks/use-regions";
import { useUrlState } from "@/hooks/use-url-state";
import { buildComparison } from "@/lib/comparison-engine";
import type { CalculatorInputs } from "@/types/calculator";

function App() {
  const [inputs, setInputs] = useState<CalculatorInputs | null>(null);
  const { regions, isLoading, error } = useRegions();
  const { urlDerivedInputs, urlKey, syncToUrl } = useUrlState();

  const handleInputsChange = useCallback(
    (newInputs: CalculatorInputs | null) => {
      setInputs(newInputs);
      syncToUrl(newInputs);
    },
    [syncToUrl],
  );

  const selectedRegion = useMemo(() => {
    if (inputs === null) {
      return null;
    }

    return regions.find((region) => region.id === inputs.regionId) ?? null;
  }, [inputs, regions]);

  const comparison = useMemo(() => {
    if (inputs === null || selectedRegion === null) {
      return null;
    }

    const pricing = CLOUD_PRICING[selectedRegion.id];

    if (pricing === undefined) {
      return null;
    }

    return buildComparison(inputs, selectedRegion, pricing);
  }, [inputs, selectedRegion]);

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          {isLoading ? (
            <p role="status" className="text-muted-foreground text-sm">
              Loading available regions…
            </p>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load regions</AlertTitle>
              <AlertDescription>
                {error}. Refresh the page and try again.
              </AlertDescription>
            </Alert>
          ) : null}

          <CalculatorForm
            key={urlKey}
            initialValues={urlDerivedInputs}
            onInputsChange={handleInputsChange}
          />

          <div aria-live="polite">
            {comparison !== null && inputs !== null ? (
              <ResultsPanel
                comparison={comparison}
                capacityTiB={inputs.capacityTiB}
                termYears={inputs.termYears}
                excludeEgress={inputs.excludeEgress === true}
              />
            ) : null}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default App;
