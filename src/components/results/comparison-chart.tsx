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
  vaultFoundation: number;
  vaultAdvanced: number;
  diy1Storage: number;
  diy1WriteOps: number;
  diy1ReadOps: number;
  diy1Retrieval: number;
  diy1Egress: number;
  diy2Storage: number;
  diy2WriteOps: number;
  diy2ReadOps: number;
  diy2Retrieval: number;
  diy2Egress: number;
}

const EMPTY_SERIES: Omit<ChartDatum, "label"> = {
  vaultFoundation: 0,
  vaultAdvanced: 0,
  diy1Storage: 0,
  diy1WriteOps: 0,
  diy1ReadOps: 0,
  diy1Retrieval: 0,
  diy1Egress: 0,
  diy2Storage: 0,
  diy2WriteOps: 0,
  diy2ReadOps: 0,
  diy2Retrieval: 0,
  diy2Egress: 0,
};

function normalizeTooltipValue(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (Array.isArray(value)) {
    return Number(value[0] ?? 0);
  }

  return Number(value ?? 0);
}

function buildChartData(comparison: ComparisonResult): ChartDatum[] {
  const data: ChartDatum[] = [];

  if (comparison.vaultFoundation.total !== null) {
    data.push({
      label: "VDC Vault Foundation",
      ...EMPTY_SERIES,
      vaultFoundation: comparison.vaultFoundation.total,
    });
  }

  if (comparison.vaultAdvanced.total !== null) {
    data.push({
      label: "VDC Vault Advanced",
      ...EMPTY_SERIES,
      vaultAdvanced: comparison.vaultAdvanced.total,
    });
  }

  data.push({
    label: comparison.diyOption1Label,
    ...EMPTY_SERIES,
    diy1Storage: comparison.diyOption1.storage,
    diy1WriteOps: comparison.diyOption1.writeOps,
    diy1ReadOps: comparison.diyOption1.readOps,
    diy1Retrieval: comparison.diyOption1.dataRetrieval,
    diy1Egress: comparison.diyOption1.internetEgress,
  });

  data.push({
    label: comparison.diyOption2Label,
    ...EMPTY_SERIES,
    diy2Storage: comparison.diyOption2.storage,
    diy2WriteOps: comparison.diyOption2.writeOps,
    diy2ReadOps: comparison.diyOption2.readOps,
    diy2Retrieval: comparison.diyOption2.dataRetrieval,
    diy2Egress: comparison.diyOption2.internetEgress,
  });

  return data;
}

export function ComparisonChart({ comparison }: ComparisonChartProps) {
  const data = buildChartData(comparison);

  return (
    <Card className="border-border/70 bg-background/90 rounded-[1.75rem] shadow-[0_32px_100px_-56px_color-mix(in_oklab,var(--electric-azure)_75%,transparent)]">
      <CardHeader className="gap-3 border-b border-[color:var(--dark-mineral)]/12 bg-[image:var(--surface-gradient)] py-5">
        <CardTitle className="text-xl tracking-[-0.03em]">
          Cost comparison
        </CardTitle>
        <CardDescription>
          Vault totals render as single bars while DIY options reveal their full
          cost stack.
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
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatUSDCompact(Number(value))}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                width={72}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatUSD(normalizeTooltipValue(value)),
                  String(name),
                ]}
                contentStyle={{
                  borderRadius: "1rem",
                  border:
                    "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
                  background: "var(--color-card)",
                }}
              />
              <Bar
                dataKey="vaultFoundation"
                name="VDC Vault Foundation"
                fill="var(--success)"
                radius={[10, 10, 0, 0]}
              />
              <Bar
                dataKey="vaultAdvanced"
                name="VDC Vault Advanced"
                fill="var(--info)"
                radius={[10, 10, 0, 0]}
              />
              <Bar
                dataKey="diy1Storage"
                name="Storage"
                stackId="diy1"
                fill="var(--color-chart-1)"
                radius={[10, 10, 0, 0]}
              />
              <Bar
                dataKey="diy1WriteOps"
                name="Write Operations"
                stackId="diy1"
                fill="var(--color-chart-2)"
              />
              <Bar
                dataKey="diy1ReadOps"
                name="Read Operations"
                stackId="diy1"
                fill="var(--color-chart-3)"
              />
              <Bar
                dataKey="diy1Retrieval"
                name="Data Retrieval"
                stackId="diy1"
                fill="var(--warning)"
              />
              <Bar
                dataKey="diy1Egress"
                name="Internet Egress"
                stackId="diy1"
                fill="var(--ignis)"
              />
              <Bar
                dataKey="diy2Storage"
                name="Storage"
                stackId="diy2"
                fill="var(--color-chart-1)"
                radius={[10, 10, 0, 0]}
              />
              <Bar
                dataKey="diy2WriteOps"
                name="Write Operations"
                stackId="diy2"
                fill="var(--color-chart-2)"
              />
              <Bar
                dataKey="diy2ReadOps"
                name="Read Operations"
                stackId="diy2"
                fill="var(--color-chart-3)"
              />
              <Bar
                dataKey="diy2Retrieval"
                name="Data Retrieval"
                stackId="diy2"
                fill="var(--warning)"
              />
              <Bar
                dataKey="diy2Egress"
                name="Internet Egress"
                stackId="diy2"
                fill="var(--ignis)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
