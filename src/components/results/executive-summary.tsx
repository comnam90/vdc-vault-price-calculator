import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import {
  deriveExecutiveSummary,
  type ExecutiveSummary as ExecutiveSummaryData,
} from "@/lib/executive-summary";
import { formatUSD } from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import type { ComparisonResult } from "@/types/calculator";

interface ExecutiveSummaryProps {
  comparison: ComparisonResult;
  capacityTiB: number;
  termYears: number;
  regionLabel: string;
}

function AnimatedUSD({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const animated = useAnimatedCounter(value);

  return (
    <p
      className={cn(
        "font-mono text-3xl font-bold tracking-[-0.05em] [font-variant-numeric:tabular-nums] sm:text-4xl",
        className,
      )}
    >
      {formatUSD(animated)}
    </p>
  );
}

function formatTerm(termYears: number): string {
  return termYears === 1 ? "1 year" : `${termYears} years`;
}

function ScopeHeader({
  capacityTiB,
  termYears,
  regionLabel,
}: {
  capacityTiB: number;
  termYears: number;
  regionLabel: string;
}) {
  const items: Array<{ label: string; value: string }> = [
    { label: "Capacity", value: `${capacityTiB} TiB` },
    { label: "Region", value: regionLabel },
    { label: "Term", value: formatTerm(termYears) },
  ];

  return (
    <dl className="flex flex-wrap gap-x-10 gap-y-3">
      {items.map(({ label, value }) => (
        <div key={label} className="space-y-1">
          <dt className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.28em] uppercase">
            {label}
          </dt>
          <dd className="dark:text-foreground text-sm font-semibold text-[color:var(--dark-mineral)]">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Recommendation({
  summary,
  termYears,
}: {
  summary: ExecutiveSummaryData;
  termYears: number;
}) {
  const termLabel = formatTerm(termYears);

  const body = (() => {
    if (summary.cheapestVault === null || summary.savings === null) {
      return (
        <>
          Vault pricing for this region is not yet published — compare once
          it&rsquo;s available.
        </>
      );
    }

    const { vaultWins, absolute, percentage } = summary.savings;

    if (absolute === 0) {
      return (
        <>
          {summary.cheapestVault.label} and {summary.cheapestDiy.label} are
          cost-equivalent over {termLabel}.
        </>
      );
    }

    const toneClass = vaultWins
      ? "text-[color:var(--viridis)]"
      : "text-[color:var(--ignis)]";
    const winnerLabel = vaultWins
      ? summary.cheapestVault.label
      : summary.cheapestDiy.label;
    const loserLabel = vaultWins
      ? summary.cheapestDiy.label
      : summary.cheapestVault.label;
    const absAmount = Math.abs(absolute);
    const absPercent = Math.abs(percentage);

    return (
      <>
        {vaultWins ? "Choose " : ""}
        <span className={cn("font-semibold", toneClass)}>{winnerLabel}</span>
        {vaultWins ? " — saves " : " is cheaper here — saves "}
        <span className="font-mono font-semibold">{formatUSD(absAmount)}</span>
        {" ("}
        <span className="font-mono">{absPercent.toFixed(1)}%</span>
        {`) over ${termLabel} vs. `}
        {loserLabel}.
      </>
    );
  })();

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.28em] uppercase">
        Recommendation
      </p>
      <p className="dark:text-foreground text-base leading-relaxed text-[color:var(--dark-mineral)] sm:text-lg">
        {body}
      </p>
    </div>
  );
}

export function ExecutiveSummary({
  comparison,
  capacityTiB,
  termYears,
  regionLabel,
}: ExecutiveSummaryProps) {
  const summary = deriveExecutiveSummary(comparison);

  return (
    <Card className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 overflow-hidden rounded-[1.5rem] border-0 bg-[image:var(--surface-gradient)] motion-safe:duration-500">
      <CardContent className="space-y-8 p-6 sm:p-8">
        <ScopeHeader
          capacityTiB={capacityTiB}
          termYears={termYears}
          regionLabel={regionLabel}
        />

        <Recommendation summary={summary} termYears={termYears} />

        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {/* Cheapest DIY */}
          <div className="space-y-2">
            <p className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.28em] uppercase">
              Cheapest DIY
            </p>
            <AnimatedUSD
              value={summary.cheapestDiy.total}
              className="dark:text-foreground text-[color:var(--dark-mineral)]"
            />
            <p className="text-muted-foreground text-sm">
              {summary.cheapestDiy.label}
            </p>
          </div>

          {/* Cheapest Vault */}
          <div className="space-y-2">
            <p className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.28em] uppercase">
              Cheapest Vault
            </p>
            {summary.cheapestVault !== null ? (
              <>
                <AnimatedUSD
                  value={summary.cheapestVault.total}
                  className="dark:text-foreground text-[color:var(--dark-mineral)]"
                />
                <p className="text-muted-foreground text-sm">
                  {summary.cheapestVault.label}
                </p>
              </>
            ) : (
              <p className="dark:text-foreground font-mono text-3xl font-bold tracking-[-0.05em] text-[color:var(--dark-mineral)] sm:text-4xl">
                Pricing TBD
              </p>
            )}
          </div>

          {/* Projected Savings */}
          <div className="space-y-2">
            <p className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.28em] uppercase">
              Projected Savings
            </p>
            {summary.savings !== null ? (
              <>
                <AnimatedUSD
                  value={Math.abs(summary.savings.absolute)}
                  className={cn(
                    summary.savings.vaultWins
                      ? "text-[color:var(--viridis)]"
                      : "text-[color:var(--ignis)]",
                  )}
                />
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-[0.65rem] tracking-[0.16em]",
                      summary.savings.vaultWins
                        ? "border-[color:var(--viridis)]/30 text-[color:var(--viridis)]"
                        : "border-[color:var(--ignis)]/30 text-[color:var(--ignis)]",
                    )}
                  >
                    {Math.abs(summary.savings.percentage).toFixed(1)}%
                  </Badge>
                  <p className="text-muted-foreground text-sm">
                    {summary.savings.vaultWins
                      ? "Vault saves vs DIY"
                      : "DIY saves vs Vault"}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                Unavailable — Vault pricing is TBD
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
