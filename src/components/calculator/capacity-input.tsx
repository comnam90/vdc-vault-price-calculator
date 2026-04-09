import type { ChangeEvent } from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CapacityInputProps {
  value?: number;
  onCapacityChange: (value: number) => void;
}

export function CapacityInput({
  value = 0,
  onCapacityChange,
}: CapacityInputProps) {
  const displayValue = value > 0 ? String(value) : "";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.currentTarget.value;

    if (rawValue === "") {
      onCapacityChange(0);
      return;
    }

    const nextValue = Number(rawValue);

    if (!Number.isNaN(nextValue)) {
      onCapacityChange(nextValue);
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="capacity-tib">Protected capacity</Label>
      <div className="relative">
        <Input
          id="capacity-tib"
          min="1"
          step={1}
          type="number"
          inputMode="numeric"
          placeholder="Enter capacity"
          value={displayValue}
          onChange={handleChange}
          className="border-border/70 bg-background/85 h-11 rounded-xl pr-14 shadow-[0_1px_0_color-mix(in_oklab,var(--dark-mineral)_8%,transparent)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium">
          TiB
        </span>
      </div>
    </div>
  );
}
