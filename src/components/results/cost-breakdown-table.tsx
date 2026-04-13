import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatUSD } from "@/lib/format-utils";
import type { ComparisonResult, VaultCostResult } from "@/types/calculator";

interface CostBreakdownTableProps {
  comparison: ComparisonResult;
  excludeEgress?: boolean;
}

interface BreakdownRow {
  category: string;
  foundation: string;
  advanced: string;
  diyOption1: string;
  diyOption2: string;
}

function formatVaultTotal(result: VaultCostResult): string {
  if (result.pricingTbd) return "TBD";
  if (result.total === null) return "N/A";
  return formatUSD(result.total);
}

function formatVaultStorageCost(result: VaultCostResult): string {
  if (result.pricingTbd) return "TBD";
  if (result.total === null) return "N/A";
  const base =
    result.overage !== undefined && result.overage > 0
      ? result.total - result.overage
      : result.total;
  return formatUSD(base);
}

export function CostBreakdownTable({
  comparison,
  excludeEgress,
}: CostBreakdownTableProps) {
  const data = useMemo<BreakdownRow[]>(() => {
    const fmt1 = (val: number) =>
      comparison.diyOption1Unavailable ? "N/A" : formatUSD(val);

    const rows: BreakdownRow[] = [
      {
        category: "Storage",
        foundation: formatVaultStorageCost(comparison.vaultFoundation),
        advanced: formatVaultTotal(comparison.vaultAdvanced),
        diyOption1: fmt1(comparison.diyOption1.storage),
        diyOption2: formatUSD(comparison.diyOption2.storage),
      },
      {
        category: "Write Operations",
        foundation: "--",
        advanced: "--",
        diyOption1: fmt1(comparison.diyOption1.writeOps),
        diyOption2: formatUSD(comparison.diyOption2.writeOps),
      },
      {
        category: "Read Operations",
        foundation: "--",
        advanced: "--",
        diyOption1: fmt1(comparison.diyOption1.readOps),
        diyOption2: formatUSD(comparison.diyOption2.readOps),
      },
      {
        category: "Data Retrieval",
        foundation: "--",
        advanced: "--",
        diyOption1: fmt1(comparison.diyOption1.dataRetrieval),
        diyOption2: formatUSD(comparison.diyOption2.dataRetrieval),
      },
      {
        category: excludeEgress
          ? "Internet Egress (excluded)"
          : "Internet Egress",
        foundation: "--",
        advanced: "--",
        diyOption1: fmt1(comparison.diyOption1.internetEgress),
        diyOption2: formatUSD(comparison.diyOption2.internetEgress),
      },
    ];

    const overage = comparison.vaultFoundation.overage;
    if (overage !== undefined && overage > 0) {
      rows.splice(4, 0, {
        category: "Restore Overage (> 20%)",
        foundation: formatUSD(overage),
        advanced: "--",
        diyOption1: "--",
        diyOption2: "--",
      });
    }

    return rows;
  }, [comparison, excludeEgress]);

  return (
    <Card className="border-border/70 bg-background/90 rounded-[1.75rem] shadow-[0_32px_100px_-56px_color-mix(in_oklab,var(--electric-azure)_75%,transparent)]">
      <CardHeader className="gap-3 border-b border-[color:var(--dark-mineral)]/12 bg-[image:var(--surface-gradient)] py-5">
        <CardTitle className="text-xl tracking-[-0.03em]">
          Cost breakdown
        </CardTitle>
        <CardDescription>
          Vault totals stay edition-level while DIY pricing exposes each
          contributing line item.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>VDC Foundation</TableHead>
              <TableHead>VDC Advanced</TableHead>
              <TableHead>{comparison.diyOption1Label}</TableHead>
              <TableHead>{comparison.diyOption2Label}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.category}>
                <TableCell>{row.category}</TableCell>
                <TableCell className="font-mono">{row.foundation}</TableCell>
                <TableCell className="font-mono">{row.advanced}</TableCell>
                <TableCell className="font-mono">{row.diyOption1}</TableCell>
                <TableCell className="font-mono">{row.diyOption2}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell className="font-mono">
                {formatVaultTotal(comparison.vaultFoundation)}
              </TableCell>
              <TableCell className="font-mono">
                {formatVaultTotal(comparison.vaultAdvanced)}
              </TableCell>
              <TableCell className="font-mono">
                {comparison.diyOption1Unavailable
                  ? "N/A"
                  : formatUSD(comparison.diyOption1.total)}
              </TableCell>
              <TableCell className="font-mono">
                {formatUSD(comparison.diyOption2.total)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
