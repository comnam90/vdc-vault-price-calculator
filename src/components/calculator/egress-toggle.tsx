import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface EgressToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function EgressToggle({ checked, onCheckedChange }: EgressToggleProps) {
  return (
    <div className="border-border/70 flex items-start gap-3 rounded-2xl border bg-[color:var(--card-tint-neutral)]/70 p-4">
      <Switch
        id="exclude-egress"
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-describedby="exclude-egress-description"
      />
      <div className="grid gap-1">
        <Label htmlFor="exclude-egress" className="cursor-pointer leading-none">
          Exclude internet egress
        </Label>
        <p
          id="exclude-egress-description"
          className="text-muted-foreground text-sm leading-snug"
        >
          For ExpressRoute or DirectConnect customers with no internet egress
          charges.
        </p>
      </div>
    </div>
  );
}
