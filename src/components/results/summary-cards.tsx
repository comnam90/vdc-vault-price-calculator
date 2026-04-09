import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MONTHS_PER_YEAR } from "@/lib/constants";
import { formatPerTbMonth, formatUSD } from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import type { ComparisonResult } from "@/types/calculator";

interface SummaryCardsProps {
  comparison: ComparisonResult;
  capacityTiB: number;
  termYears: number;
}

interface SummaryCardItem {
  id: string;
  title: string;
  total: number | null;
  rate: number | null;
  pricingTbd: boolean;
  unavailable?: boolean;
}

function deriveDiyRate(
  total: number,
  capacityTiB: number,
  termYears: number,
): number | null {
  if (capacityTiB <= 0 || termYears <= 0) {
    return null;
  }

  return total / (capacityTiB * termYears * MONTHS_PER_YEAR);
}

function formatTotalValue(
  total: number | null,
  pricingTbd: boolean,
  unavailable?: boolean,
): string {
  if (unavailable) {
    return "ZRS not available";
  }

  if (pricingTbd) {
    return "Pricing TBD";
  }

  if (total === null) {
    return "N/A";
  }

  return formatUSD(total);
}

function formatRateValue(
  rate: number | null,
  pricingTbd: boolean,
  unavailable?: boolean,
): string {
  if (unavailable) {
    return "—";
  }

  if (pricingTbd) {
    return "TBD";
  }

  if (rate === null) {
    return "N/A";
  }

  return formatPerTbMonth(Number(rate.toFixed(2)));
}

export function SummaryCards({
  comparison,
  capacityTiB,
  termYears,
}: SummaryCardsProps) {
  const cards: SummaryCardItem[] = [
    {
      id: "vault-foundation",
      title: "VDC Vault Foundation",
      total: comparison.vaultFoundation.total,
      rate: comparison.vaultFoundation.perTbMonth,
      pricingTbd: comparison.vaultFoundation.pricingTbd,
    },
    {
      id: "vault-advanced",
      title: "VDC Vault Advanced",
      total: comparison.vaultAdvanced.total,
      rate: comparison.vaultAdvanced.perTbMonth,
      pricingTbd: comparison.vaultAdvanced.pricingTbd,
    },
    {
      id: "diy-option-1",
      title: comparison.diyOption1Label,
      total: comparison.diyOption1Unavailable
        ? null
        : comparison.diyOption1.total,
      rate: comparison.diyOption1Unavailable
        ? null
        : deriveDiyRate(comparison.diyOption1.total, capacityTiB, termYears),
      pricingTbd: false,
      unavailable: comparison.diyOption1Unavailable,
    },
    {
      id: "diy-option-2",
      title: comparison.diyOption2Label,
      total: comparison.diyOption2.total,
      rate: deriveDiyRate(comparison.diyOption2.total, capacityTiB, termYears),
      pricingTbd: false,
    },
  ];

  const cheapestTotal = cards.reduce<number | null>((lowest, card) => {
    if (card.total === null) {
      return lowest;
    }

    if (lowest === null || card.total < lowest) {
      return card.total;
    }

    return lowest;
  }, null);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const isCheapest =
          cheapestTotal !== null && card.total === cheapestTotal;

        const isVault =
          card.id === "vault-foundation" || card.id === "vault-advanced";
        const isDiy = card.id === "diy-option-1" || card.id === "diy-option-2";

        return (
          <Card
            key={card.id}
            style={{ animationDelay: `${index * 80}ms` }}
            className={cn(
              "border-border/70 bg-background/90 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 rounded-[1.5rem] shadow-[0_24px_72px_-48px_color-mix(in_oklab,var(--electric-azure)_60%,transparent)] motion-safe:duration-500",
              isVault &&
                !isCheapest &&
                "border-t-2 border-t-[color:var(--viridis)]/40",
              isDiy &&
                !isCheapest &&
                "border-t-2 border-t-[color:var(--electric-azure)]/35",
              isCheapest &&
                "bg-card-tint-success border-t-2 border-[color:var(--success)]/25 border-t-[color:var(--viridis)]/60 shadow-[0_24px_72px_-48px_color-mix(in_oklab,var(--success)_50%,transparent)]",
            )}
          >
            <CardHeader className="gap-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base leading-6 tracking-[-0.03em]">
                  {card.title}
                </CardTitle>
                {isCheapest ? (
                  <Badge className="rounded-full border border-[color:var(--success)]/20 bg-[color:var(--success-muted)] px-2.5 py-1 font-mono text-[0.65rem] tracking-[0.16em] text-[color:var(--dark-mineral)] uppercase">
                    Lowest total
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="dark:text-foreground text-2xl font-semibold tracking-[-0.05em] text-[color:var(--dark-mineral)] [font-variant-numeric:tabular-nums]">
                {formatTotalValue(
                  card.total,
                  card.pricingTbd,
                  card.unavailable,
                )}
              </p>
              <div className="space-y-1">
                <p className="text-muted-foreground font-mono text-[0.68rem] tracking-[0.2em] uppercase">
                  Effective rate
                </p>
                <p className="text-sm font-medium">
                  {formatRateValue(
                    card.rate,
                    card.pricingTbd,
                    card.unavailable,
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
