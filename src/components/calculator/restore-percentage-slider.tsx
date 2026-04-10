import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface RestorePercentageSliderProps {
  value: number;
  capacityTiB: number;
  onValueChange: (value: number) => void;
}

export function RestorePercentageSlider({
  value,
  capacityTiB,
  onValueChange,
}: RestorePercentageSliderProps) {
  // draft tracks the live thumb position for display; the parent is only notified on commit
  const [draft, setDraft] = useState(value);

  // Sync draft if parent value changes externally (e.g., URL-derived initial value)
  useEffect(() => {
    setDraft(value);
  }, [value]);

  const tibDisplay =
    capacityTiB > 0
      ? `${((draft / 100) * capacityTiB).toFixed(1)} TiB (${draft}%)`
      : `${draft}%`;

  return (
    <div className="border-border/70 grid gap-3 rounded-2xl border bg-[color:var(--card-tint-neutral)]/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="restore-percentage" className="leading-none">
          Annual restore
        </Label>
        <span
          aria-live="polite"
          aria-atomic="true"
          className="text-muted-foreground text-sm font-medium [font-variant-numeric:tabular-nums]"
        >
          {tibDisplay}
        </span>
      </div>
      <Slider
        id="restore-percentage"
        min={0}
        max={100}
        step={1}
        value={[draft]}
        onValueChange={([next]) => setDraft(next)}
        onValueCommit={([committed]) => onValueChange(committed)}
        aria-label="Annual restore percentage"
        aria-describedby={draft > 20 ? "restore-overage-note" : undefined}
      />
      {draft > 20 && (
        <p
          id="restore-overage-note"
          className="text-muted-foreground text-sm leading-snug"
          role="note"
        >
          Restore above 20% incurs Vault Foundation overage charges (read ops,
          data retrieval, and internet egress) at infrequent-access rates.
        </p>
      )}
    </div>
  );
}
