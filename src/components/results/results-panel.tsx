import { useState } from "react";
import { BarChart3, LayoutList } from "lucide-react";

import { Assumptions } from "@/components/results/assumptions";
import { ComparisonChart } from "@/components/results/comparison-chart";
import { CostBreakdownTable } from "@/components/results/cost-breakdown-table";
import { NonCoreBanner } from "@/components/results/non-core-banner";
import { SummaryCards } from "@/components/results/summary-cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ComparisonResult } from "@/types/calculator";

interface ResultsPanelProps {
  comparison: ComparisonResult | null;
  capacityTiB: number;
  termYears: number;
}

export function ResultsPanel({
  comparison,
  capacityTiB,
  termYears,
}: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (comparison === null) {
    return null;
  }

  return (
    <section
      className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 space-y-5 motion-safe:duration-500"
      aria-label="Comparison results"
    >
      <div className="space-y-2">
        <p className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.28em] uppercase">
          Cost analysis
        </p>
        <h2 className="dark:text-foreground text-2xl font-semibold tracking-[-0.04em] text-[color:var(--dark-mineral)]">
          Comparison results
        </h2>
      </div>

      <NonCoreBanner comparison={comparison} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
        <TabsList className="border-border/70 bg-background/80 h-auto w-full justify-start rounded-full border p-1">
          <TabsTrigger value="overview" className="rounded-full px-4">
            <BarChart3 className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="rounded-full px-4">
            <LayoutList className="size-4" />
            Breakdown
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <SummaryCards
            comparison={comparison}
            capacityTiB={capacityTiB}
            termYears={termYears}
          />
          <ComparisonChart comparison={comparison} />
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <CostBreakdownTable comparison={comparison} />
          <Assumptions />
        </TabsContent>
      </Tabs>
    </section>
  );
}
