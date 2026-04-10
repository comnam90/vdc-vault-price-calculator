import { useState } from "react";
import { BarChart3, LayoutList, TrendingUp } from "lucide-react";

import { Assumptions } from "@/components/results/assumptions";
import { ComparisonChart } from "@/components/results/comparison-chart";
import { CostBreakdownTable } from "@/components/results/cost-breakdown-table";
import { CostTrendChart } from "@/components/results/cost-trend-chart";
import { NonCoreBanner } from "@/components/results/non-core-banner";
import { SummaryCards } from "@/components/results/summary-cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ComparisonResult } from "@/types/calculator";

interface ResultsPanelProps {
  comparison: ComparisonResult | null;
  capacityTiB: number;
  termYears: number;
  excludeEgress?: boolean;
  restorePercentage: number;
}

export function ResultsPanel({
  comparison,
  capacityTiB,
  termYears,
  excludeEgress,
  restorePercentage,
}: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const showTrend = termYears > 1;
  // Derive effective tab: if trend tab is selected but no longer available, fall back to overview.
  const effectiveTab =
    !showTrend && activeTab === "trend" ? "overview" : activeTab;

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
        <h2 className="font-heading dark:text-foreground flex flex-wrap items-baseline gap-2 text-2xl font-bold tracking-[-0.04em] text-[color:var(--dark-mineral)]">
          Comparison results
          <abbr
            title="United States Dollar"
            aria-label="All prices in US dollars"
            className="text-muted-foreground text-sm font-normal tracking-normal not-italic"
          >
            (USD)
          </abbr>
        </h2>
      </div>

      <NonCoreBanner comparison={comparison} />

      <Tabs value={effectiveTab} onValueChange={setActiveTab} className="gap-4">
        <TabsList className="border-border/70 bg-background/80 h-auto w-full justify-start rounded-full border p-1">
          <TabsTrigger value="overview" className="rounded-full px-4">
            <BarChart3 className="size-4" aria-hidden="true" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="rounded-full px-4">
            <LayoutList className="size-4" aria-hidden="true" />
            Breakdown
          </TabsTrigger>
          {showTrend && (
            <TabsTrigger value="trend" className="rounded-full px-4">
              <TrendingUp className="size-4" aria-hidden="true" />
              Over time
            </TabsTrigger>
          )}
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
          <CostBreakdownTable
            comparison={comparison}
            excludeEgress={excludeEgress}
          />
          <Assumptions restorePercentage={restorePercentage} />
        </TabsContent>

        {showTrend && (
          <TabsContent value="trend">
            <CostTrendChart comparison={comparison} termYears={termYears} />
          </TabsContent>
        )}
      </Tabs>
    </section>
  );
}
