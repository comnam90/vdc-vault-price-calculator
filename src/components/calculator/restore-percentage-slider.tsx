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
  const tibDisplay =
    capacityTiB > 0
      ? `${((value / 100) * capacityTiB).toFixed(1)} TiB (${value}%)`
      : `${value}%`;

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
        value={[value]}
        onValueChange={([next]) => onValueChange(next)}
        aria-label="Annual restore percentage"
        aria-describedby={value > 20 ? "restore-overage-note" : undefined}
      />
      {value > 20 && (
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
