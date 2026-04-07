import { useMemo, useState } from "react";
import { Check, ChevronDown, MapPinned } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Region } from "@/types/region";

interface RegionSelectorProps {
  regions: Region[];
  selectedRegion: Region | null;
  isLoading: boolean;
  onRegionChange: (region: Region) => void;
}

const PROVIDER_ORDER = ["AWS", "Azure"] as const;
const REGION_TRIGGER_ID = "region-selector-trigger";

function ProviderBadge({ provider }: { provider: Region["provider"] }) {
  const providerClasses =
    provider === "AWS"
      ? "border-[color:var(--dark-mineral)]/15 bg-[color:var(--card-tint-neutral)] text-[color:var(--dark-mineral)]"
      : "border-[color:var(--electric-azure)]/20 bg-[color:var(--info-muted)] text-[color:var(--electric-azure)]";

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2 py-0.5 font-mono text-[0.65rem] tracking-[0.18em] uppercase",
        providerClasses,
      )}
    >
      {provider}
    </Badge>
  );
}

export function RegionSelector({
  regions,
  selectedRegion,
  isLoading,
  onRegionChange,
}: RegionSelectorProps) {
  const [open, setOpen] = useState(false);

  const groupedRegions = useMemo(() => {
    return PROVIDER_ORDER.map((provider) => ({
      provider,
      regions: regions.filter((region) => region.provider === provider),
    })).filter((group) => group.regions.length > 0);
  }, [regions]);

  if (isLoading) {
    return (
      <div className="grid gap-2">
        <Label htmlFor={REGION_TRIGGER_ID}>Region</Label>
        <div
          role="status"
          aria-label="Loading regions"
          className="border-border/70 space-y-3 rounded-2xl border bg-[color:var(--card-tint-neutral)]/60 p-4"
        >
          <div className="bg-background/80 h-11 rounded-xl motion-safe:animate-pulse" />
          <div className="grid gap-2">
            <div className="bg-background/70 h-3 w-20 rounded motion-safe:animate-pulse" />
            <div className="bg-background/70 h-9 rounded-lg motion-safe:animate-pulse" />
            <div className="bg-background/60 h-9 rounded-lg motion-safe:animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={REGION_TRIGGER_ID}>Region</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={REGION_TRIGGER_ID}
            type="button"
            variant="outline"
            role="combobox"
            aria-label="Select a region"
            aria-expanded={open}
            aria-controls="region-selector-list"
            className="border-border/70 bg-background/85 h-11 w-full justify-between rounded-xl px-4 text-left font-normal shadow-[0_1px_0_color-mix(in_oklab,var(--dark-mineral)_8%,transparent)]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <MapPinned className="size-4 shrink-0 text-[color:var(--electric-azure)]" />
              {selectedRegion ? (
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate">{selectedRegion.name}</span>
                  <ProviderBadge provider={selectedRegion.provider} />
                </span>
              ) : (
                <span className="text-muted-foreground">Select a region</span>
              )}
            </span>
            <ChevronDown className="text-muted-foreground size-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="border-border/70 w-[min(26rem,var(--radix-popover-trigger-width))] rounded-2xl p-0">
          <Command className="rounded-2xl">
            <CommandInput
              aria-label="Select a region"
              placeholder="Search regions or aliases"
              autoFocus
            />
            <CommandList
              id="region-selector-list"
              role="listbox"
              aria-label="Regions"
            >
              <CommandEmpty>No matching regions found.</CommandEmpty>
              {groupedRegions.map((group) => (
                <CommandGroup key={group.provider} heading={group.provider}>
                  {group.regions.map((region) => {
                    const isSelected = selectedRegion?.id === region.id;

                    return (
                      <CommandItem
                        key={region.id}
                        value={region.name}
                        keywords={region.aliases}
                        role="option"
                        aria-selected={isSelected}
                        onSelect={() => {
                          onRegionChange(region);
                          setOpen(false);
                        }}
                        className="rounded-lg px-3 py-2"
                      >
                        <Check
                          className={cn(
                            "size-4 text-[color:var(--viridis)] transition-opacity",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                          <span className="truncate">{region.name}</span>
                          <ProviderBadge provider={region.provider} />
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
