import {
  Bar,
  BarChart,
  CartesianGrid,
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

interface ComparisonChartProps {
  comparison: ComparisonResult;
}

interface ChartDatum {
  label: string;
  vaultFoundationBase: number;
  vaultFoundationOverage: number;
  vaultAdvanced: number;
  storage: number;
  writeOps: number;
  readOps: number;
  retrieval: number;
  egress: number;
}

const DIY_LEGEND_ITEMS: Array<{ name: string; fill: string }> = [
  { name: "Storage", fill: "var(--color-chart-1)" },
  { name: "Write Operations", fill: "var(--color-chart-2)" },
  { name: "Read Operations", fill: "var(--color-chart-3)" },
  { name: "Data Retrieval", fill: "var(--warning)" },
  { name: "Internet Egress", fill: "var(--ignis)" },
];

const VAULT_ZERO = {
  vaultFoundationBase: 0,
  vaultFoundationOverage: 0,
  vaultAdvanced: 0,
};
const DIY_ZERO = {
  storage: 0,
  writeOps: 0,
  readOps: 0,
  retrieval: 0,
  egress: 0,
};

function buildChartData(comparison: ComparisonResult): ChartDatum[] {
  const data: ChartDatum[] = [];

  if (comparison.vaultFoundation.total !== null) {
    const overage = comparison.vaultFoundation.overage ?? 0;
    const base = comparison.vaultFoundation.total - overage;
    data.push({
      label: "VDC Vault Foundation",
      ...VAULT_ZERO,
      vaultFoundationBase: base,
      vaultFoundationOverage: overage,
      ...DIY_ZERO,
    });
  }

  if (comparison.vaultAdvanced.total !== null) {
    data.push({
      label: "VDC Vault Advanced",
      ...VAULT_ZERO,
      vaultAdvanced: comparison.vaultAdvanced.total,
      ...DIY_ZERO,
    });
  }

  if (!comparison.diyOption1Unavailable) {
    data.push({
      label: comparison.diyOption1Label,
      ...VAULT_ZERO,
      storage: comparison.diyOption1.storage,
      writeOps: comparison.diyOption1.writeOps,
      readOps: comparison.diyOption1.readOps,
      retrieval: comparison.diyOption1.dataRetrieval,
      egress: comparison.diyOption1.internetEgress,
    });
  }

  data.push({
    label: comparison.diyOption2Label,
    ...VAULT_ZERO,
    storage: comparison.diyOption2.storage,
    writeOps: comparison.diyOption2.writeOps,
    readOps: comparison.diyOption2.readOps,
    retrieval: comparison.diyOption2.dataRetrieval,
    egress: comparison.diyOption2.internetEgress,
  });

  return data;
}

interface ChartLegendProps {
  data: ChartDatum[];
  hasFoundationOverage: boolean;
}

function ChartLegend({ data, hasFoundationOverage }: ChartLegendProps) {
  const vaultItems: Array<{ name: string; fill: string }> = [];

  if (data.some((d) => d.vaultFoundationBase > 0)) {
    vaultItems.push({ name: "VDC Vault Foundation", fill: "var(--success)" });
  }
  if (hasFoundationOverage) {
    // var(--warning) is also used for Data Retrieval in DIY rows; the two
    // series never coexist in the same stacked bar, so the shared token is
    // unambiguous in the chart itself — legend labels distinguish them.
    vaultItems.push({ name: "Restore Overage", fill: "var(--warning)" });
  }
  if (data.some((d) => d.vaultAdvanced > 0)) {
    vaultItems.push({ name: "VDC Vault Advanced", fill: "var(--info)" });
  }

  const items = [...vaultItems, ...DIY_LEGEND_ITEMS];

  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 pt-5">
      {items.map((item) => (
        <span
          key={item.name}
          className="text-muted-foreground flex items-center gap-1.5 text-xs"
        >
          <span
            className="size-2.5 shrink-0 rounded-[3px]"
            style={{ backgroundColor: item.fill }}
          />
          {item.name}
        </span>
      ))}
    </div>
  );
}

interface TooltipEntry {
  name?: string | number;
  value?: string | number | readonly (string | number)[];
  fill?: string;
}

function numericValue(value: TooltipEntry["value"]): number {
  return typeof value === "number" ? value : 0;
}

export function ChartTooltip({
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

  const total = entries.reduce((sum, e) => sum + numericValue(e.value), 0);
  const showPct = entries.length > 1;

  return (
    <div className="border-border/80 bg-card rounded-2xl border p-3 shadow-lg">
      <p className="text-foreground mb-2 text-sm font-medium">
        {String(label ?? "")}
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
              style={{ color: entry.fill }}
            >
              {formatUSD(numericValue(entry.value))}
              {showPct && (
                <span className="text-muted-foreground ml-1.5 font-normal">
                  ({Math.round((numericValue(entry.value) / total) * 100)}%)
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WrappedXAxisTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
}) {
  const words = (payload?.value ?? "").split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > 14 && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={line}
          x={0}
          y={0}
          dy={i * 13 + 10}
          textAnchor="middle"
          fill="var(--color-muted-foreground)"
          fontSize={11}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

export function ComparisonChart({ comparison }: ComparisonChartProps) {
  const data = buildChartData(comparison);
  const hasFoundationOverage = data.some((d) => d.vaultFoundationOverage > 0);

  return (
    <Card className="border-border/50 bg-background/90 overflow-hidden rounded-[1.75rem] pt-0">
      <CardHeader className="gap-3 border-b border-[color:var(--dark-mineral)]/12 bg-[image:var(--surface-gradient)] py-5">
        <CardTitle className="text-xl tracking-[-0.03em]">
          Cost comparison
        </CardTitle>
        <CardDescription>
          Foundation splits into base cost and restore overage when applicable;
          DIY options reveal their full cost breakdown.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div
          role="img"
          aria-label="Comparison of Vault and DIY totals"
          className="h-80 w-full"
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            minHeight={320}
            initialDimension={{ width: 960, height: 320 }}
          >
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
            >
              <CartesianGrid
                stroke="color-mix(in oklab, var(--border) 80%, transparent)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                height={56}
                interval={0}
                tick={<WrappedXAxisTick />}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatUSDCompact(Number(value))}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                width={72}
              />
              <Tooltip content={ChartTooltip} />
              {/*
               * All bars share stackId="cost" so each data point renders as
               * a single stacked unit — one bar centered under its x-axis label.
               * Vault rows have only vaultFoundation or vaultAdvanced non-zero;
               * DIY rows have only storage/writeOps/etc non-zero.
               */}
              <Bar
                dataKey="vaultFoundationBase"
                name="VDC Vault Foundation"
                stackId="cost"
                fill="var(--success)"
                legendType="none"
                radius={hasFoundationOverage ? [0, 0, 0, 0] : [6, 6, 0, 0]}
              />
              <Bar
                dataKey="vaultFoundationOverage"
                name="Restore Overage"
                stackId="cost"
                fill="var(--warning)"
                legendType="none"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="vaultAdvanced"
                name="VDC Vault Advanced"
                stackId="cost"
                fill="var(--info)"
                legendType="none"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="storage"
                name="Storage"
                stackId="cost"
                fill="var(--color-chart-1)"
                legendType="none"
              />
              <Bar
                dataKey="writeOps"
                name="Write Operations"
                stackId="cost"
                fill="var(--color-chart-2)"
                legendType="none"
              />
              <Bar
                dataKey="readOps"
                name="Read Operations"
                stackId="cost"
                fill="var(--color-chart-3)"
                legendType="none"
              />
              <Bar
                dataKey="retrieval"
                name="Data Retrieval"
                stackId="cost"
                fill="var(--warning)"
                legendType="none"
              />
              <Bar
                dataKey="egress"
                name="Internet Egress"
                stackId="cost"
                fill="var(--ignis)"
                legendType="none"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend data={data} hasFoundationOverage={hasFoundationOverage} />
      </CardContent>
    </Card>
  );
}
