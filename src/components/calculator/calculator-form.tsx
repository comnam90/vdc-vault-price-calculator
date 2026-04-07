import { useEffect, useMemo, useState } from "react";

import { CapacityInput } from "@/components/calculator/capacity-input";
import { RegionSelector } from "@/components/calculator/region-selector";
import { TermSelector } from "@/components/calculator/term-selector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRegions } from "@/hooks/use-regions";
import type { CalculatorInputs } from "@/types/calculator";
import type { Region } from "@/types/region";

interface CalculatorFormProps {
  onInputsChange: (inputs: CalculatorInputs | null) => void;
}

export function CalculatorForm({ onInputsChange }: CalculatorFormProps) {
  const { regions, isLoading } = useRegions();
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [termYears, setTermYears] = useState(1);
  const [capacityTiB, setCapacityTiB] = useState(0);

  const completeInputs = useMemo<CalculatorInputs | null>(() => {
    if (!selectedRegion || capacityTiB < 1) {
      return null;
    }

    return {
      regionId: selectedRegion.id,
      termYears,
      capacityTiB,
    };
  }, [capacityTiB, selectedRegion, termYears]);

  useEffect(() => {
    onInputsChange(completeInputs);
  }, [completeInputs, onInputsChange]);

  return (
    <Card className="border-border/70 bg-background/90 overflow-hidden rounded-[1.75rem] shadow-[0_32px_100px_-56px_color-mix(in_oklab,var(--electric-azure)_75%,transparent)] backdrop-blur">
      <CardHeader className="border-border/70 gap-3 border-b bg-[image:var(--surface-gradient)] py-5">
        <CardTitle className="text-xl tracking-[-0.03em]">
          Calculation inputs
        </CardTitle>
        <CardDescription>
          Select a provider region, commitment term, and protected capacity.
          Inputs update immediately—no submit flow.
        </CardDescription>
      </CardHeader>
      <CardContent className="py-6">
        <form
          aria-label="Vault pricing inputs"
          className="grid gap-5 lg:grid-cols-2 lg:items-start"
        >
          <div className="lg:col-span-2">
            <RegionSelector
              regions={regions}
              isLoading={isLoading}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
            />
          </div>
          <TermSelector value={termYears} onTermChange={setTermYears} />
          <CapacityInput
            value={capacityTiB}
            onCapacityChange={setCapacityTiB}
          />
        </form>
      </CardContent>
    </Card>
  );
}
