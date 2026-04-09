import { useEffect, useMemo, useState } from "react";

import { CapacityInput } from "@/components/calculator/capacity-input";
import { EgressToggle } from "@/components/calculator/egress-toggle";
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
  initialValues?: Partial<CalculatorInputs>;
}

export function CalculatorForm({
  onInputsChange,
  initialValues,
}: CalculatorFormProps) {
  const { regions, isLoading } = useRegions();

  // Explicit user selection — null means "not yet chosen by the user"
  const [userSelectedRegion, setUserSelectedRegion] = useState<Region | null>(
    null,
  );
  const [userHasSelected, setUserHasSelected] = useState(false);

  const [termYears, setTermYears] = useState(initialValues?.termYears ?? 1);
  const [capacityTiB, setCapacityTiB] = useState(
    initialValues?.capacityTiB ?? 0,
  );
  const [excludeEgress, setExcludeEgress] = useState(
    initialValues?.excludeEgress ?? false,
  );

  // Before the user makes an explicit choice, derive the region from initialValues.
  // After user interaction, userHasSelected takes precedence.
  const initialRegionId = initialValues?.regionId;
  const selectedRegion = useMemo<Region | null>(() => {
    if (userHasSelected) return userSelectedRegion;
    if (!initialRegionId || isLoading) return null;
    return regions.find((r) => r.id === initialRegionId) ?? null;
  }, [
    userHasSelected,
    userSelectedRegion,
    initialRegionId,
    isLoading,
    regions,
  ]);

  const handleRegionChange = (region: Region | null) => {
    setUserHasSelected(true);
    setUserSelectedRegion(region);
  };

  const completeInputs = useMemo<CalculatorInputs | null>(() => {
    if (!selectedRegion || capacityTiB < 1) {
      return null;
    }

    return {
      regionId: selectedRegion.id,
      termYears,
      capacityTiB,
      excludeEgress,
    };
  }, [capacityTiB, excludeEgress, selectedRegion, termYears]);

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
          Select a region, commitment term, and protected capacity to see a live
          cost comparison.
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
              onRegionChange={handleRegionChange}
            />
          </div>
          <TermSelector value={termYears} onTermChange={setTermYears} />
          <CapacityInput
            value={capacityTiB}
            onCapacityChange={setCapacityTiB}
          />
          <div className="lg:col-span-2">
            <EgressToggle
              checked={excludeEgress}
              onCheckedChange={setExcludeEgress}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
