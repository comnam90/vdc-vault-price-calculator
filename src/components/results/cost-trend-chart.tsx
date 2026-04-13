import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatUSD, formatUSDCompact } from "@/lib/format-utils";
import type { ComparisonResult } from "@/types/calculator";

interface CostTrendChartProps {
  comparison: ComparisonResult;
  termYears: number;
}

interface TrendDatum {
  year: number;
  vaultFoundation?: number;
  vaultAdvanced?: number;
  diy1?: number;
  diy2?: number;
}

function buildTrendData(
  comparison: ComparisonResult,
  termYears: number,
): TrendDatum[] {
  return Array.from({ length: termYears }, (_, i) => {
    const year = i + 1;
    const fraction = year / termYears;
    const datum: TrendDatum = { year };

    if (
      comparison.vaultFoundation.total !== null &&
      !comparison.vaultFoundation.pricingTbd
    ) {
      datum.vaultFoundation = comparison.vaultFoundation.total * fraction;
    }

    if (
      comparison.vaultAdvanced.total !== null &&
      !comparison.vaultAdvanced.pricingTbd
    ) {
      datum.vaultAdvanced = comparison.vaultAdvanced.total * fraction;
    }

    if (!comparison.diyOption1Unavailable) {
      datum.diy1 = comparison.diyOption1.total * fraction;
    }

    datum.diy2 = comparison.diyOption2.total * fraction;

    return datum;
  });
}

interface LegendItem {
  name: string;
  color: string;
}

function buildLegendItems(comparison: ComparisonResult): LegendItem[] {
  const items: LegendItem[] = [];

  if (
    comparison.vaultFoundation.total !== null &&
    !comparison.vaultFoundation.pricingTbd
  ) {
    items.push({ name: "VDC Vault Foundation", color: "var(--success)" });
  }

  if (
    comparison.vaultAdvanced.total !== null &&
    !comparison.vaultAdvanced.pricingTbd
  ) {
    items.push({ name: "VDC Vault Advanced", color: "var(--info)" });
  }

  if (!comparison.diyOption1Unavailable) {
    items.push({
      name: comparison.diyOption1Label,
      color: "var(--color-chart-1)",
    });
  }

  items.push({
    name: comparison.diyOption2Label,
    color: "var(--color-chart-3)",
  });

  return items;
}

interface TooltipEntry {
  name?: string | number;
  value?: string | number | readonly (string | number)[];
  stroke?: string;
}

function numericValue(value: TooltipEntry["value"]): number {
  return typeof value === "number" ? value : 0;
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<TooltipEntry>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  const entries = payload.filter((e) => numericValue(e.value) > 0);
  if (!entries.length) return null;

  return (
    <div className="border-border/80 bg-card rounded-2xl border p-3 shadow-lg">
      <p className="text-foreground mb-2 text-sm font-medium">
        {typeof label === "number" ? `Year ${label}` : String(label ?? "")}
      </p>
      <div className="space-y-1">
        {entries.map((entry) => (
          <div
            key={String(entry.name ?? "")}
            className="flex items-center justify-between gap-6 text-xs"
          >
            <span className="text-muted-foreground">
              {String(entry.name ?? "")}
            </span>
            <span
              className="font-medium [font-variant-numeric:tabular-nums]"
              style={{ color: entry.stroke }}
            >
              {formatUSD(numericValue(entry.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CostTrendChart({ comparison, termYears }: CostTrendChartProps) {
  const data = buildTrendData(comparison, termYears);
  const legendItems = buildLegendItems(comparison);

  const showFoundation =
    comparison.vaultFoundation.total !== null &&
    !comparison.vaultFoundation.pricingTbd;
  const showAdvanced =
    comparison.vaultAdvanced.total !== null &&
    !comparison.vaultAdvanced.pricingTbd;
  const showDiy1 = !comparison.diyOption1Unavailable;

  return (
    <Card className="border-border/50 bg-background/90 rounded-[1.75rem]">
      <CardHeader className="gap-3 border-b border-[color:var(--dark-mineral)]/12 bg-[image:var(--surface-gradient)] py-5">
        <CardTitle className="text-xl tracking-[-0.03em]">
          Cost over time
        </CardTitle>
        <CardDescription>
          Cumulative spend per option at the end of each year of your{" "}
          {termYears}-year commitment.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div
          role="img"
          aria-label={`Cumulative cost over ${termYears} years`}
          className="h-80 w-full"
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            minHeight={320}
            initialDimension={{ width: 960, height: 320 }}
          >
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
            >
              <CartesianGrid
                stroke="color-mix(in oklab, var(--border) 80%, transparent)"
                vertical={false}
              />
              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `Year ${v}`}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                height={40}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatUSDCompact(Number(v))}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                width={72}
              />
              <Tooltip content={TrendTooltip} />
              {showFoundation && (
                <Line
                  dataKey="vaultFoundation"
                  name="VDC Vault Foundation"
                  stroke="var(--success)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--success)" }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              )}
              {showAdvanced && (
                <Line
                  dataKey="vaultAdvanced"
                  name="VDC Vault Advanced"
                  stroke="var(--info)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--info)" }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              )}
              {showDiy1 && (
                <Line
                  dataKey="diy1"
                  name={comparison.diyOption1Label}
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--color-chart-1)" }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              )}
              <Line
                dataKey="diy2"
                name={comparison.diyOption2Label}
                stroke="var(--color-chart-3)"
                strokeWidth={2}
                dot={{ r: 4, fill: "var(--color-chart-3)" }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 pt-5">
          {legendItems.map((item) => (
            <span
              key={item.name}
              className="text-muted-foreground flex items-center gap-1.5 text-xs"
            >
              <span
                className="size-2.5 shrink-0 rounded-[3px]"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
