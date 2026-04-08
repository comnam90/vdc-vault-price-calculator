import { ChevronDown, Scale } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function Assumptions() {
  return (
    <Collapsible className="border-border/70 bg-background/90 rounded-[1.5rem] border shadow-[0_24px_72px_-48px_color-mix(in_oklab,var(--electric-azure)_55%,transparent)]">
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
        <div className="space-y-2">
          <p className="text-muted-foreground font-mono text-[0.68rem] tracking-[0.24em] uppercase">
            Methodology
          </p>
          <div className="flex items-center gap-2 text-base font-semibold tracking-[-0.03em]">
            <Scale className="size-4 text-[color:var(--electric-azure)]" />
            <span>Calculation assumptions</span>
          </div>
        </div>
        <ChevronDown className="text-muted-foreground size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-[color:var(--dark-mineral)]/12 px-6 pb-6">
        <ul className="text-muted-foreground grid gap-3 pt-5 text-sm leading-6">
          <li>
            1 MB operation size is applied to every write and read transaction.
          </li>
          <li>
            20% annual read-back is assumed for data restored from archive
            storage.
          </li>
          <li>
            20% annual egress is assumed for internet transfer out of the
            platform.
          </li>
          <li>
            AWS storage rates use the published 50 TB–500 TB price tier and
            egress rates use the 10 TB–50 TB price tier as representative rates
            for enterprise-scale workloads.
          </li>
          <li>
            Calculator totals combine published VDC Vault Core pricing with
            repository-maintained DIY assumptions for directional comparison
            only.
          </li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
