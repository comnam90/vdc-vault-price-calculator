import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import { deriveExecutiveSummary } from "@/lib/executive-summary";
import { formatUSD } from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import type { ComparisonResult } from "@/types/calculator";

interface ExecutiveSummaryProps {
  comparison: ComparisonResult;
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

export function ExecutiveSummary({ comparison }: ExecutiveSummaryProps) {
  const summary = deriveExecutiveSummary(comparison);

  return (
    <Card className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 overflow-hidden rounded-[1.5rem] border-0 bg-[image:var(--surface-gradient)] motion-safe:duration-500">
      <CardContent className="grid gap-8 p-6 sm:p-8 md:grid-cols-3 md:gap-6">
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
            <p className="font-mono text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
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
      </CardContent>
    </Card>
  );
}
