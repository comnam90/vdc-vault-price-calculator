import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

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
}

interface BreakdownRow {
  category: string;
  foundation: string;
  advanced: string;
  diyOption1: string;
  diyOption2: string;
}

const columnHelper = createColumnHelper<BreakdownRow>();

function formatVaultTotal(result: VaultCostResult): string {
  if (result.pricingTbd) {
    return "TBD";
  }

  if (result.total === null) {
    return "N/A";
  }

  return formatUSD(result.total);
}

export function CostBreakdownTable({ comparison }: CostBreakdownTableProps) {
  const data: BreakdownRow[] = [
    {
      category: "Storage",
      foundation: "--",
      advanced: "--",
      diyOption1: formatUSD(comparison.diyOption1.storage),
      diyOption2: formatUSD(comparison.diyOption2.storage),
    },
    {
      category: "Write Operations",
      foundation: "--",
      advanced: "--",
      diyOption1: formatUSD(comparison.diyOption1.writeOps),
      diyOption2: formatUSD(comparison.diyOption2.writeOps),
    },
    {
      category: "Read Operations",
      foundation: "--",
      advanced: "--",
      diyOption1: formatUSD(comparison.diyOption1.readOps),
      diyOption2: formatUSD(comparison.diyOption2.readOps),
    },
    {
      category: "Data Retrieval",
      foundation: "--",
      advanced: "--",
      diyOption1: formatUSD(comparison.diyOption1.dataRetrieval),
      diyOption2: formatUSD(comparison.diyOption2.dataRetrieval),
    },
    {
      category: "Internet Egress",
      foundation: "--",
      advanced: "--",
      diyOption1: formatUSD(comparison.diyOption1.internetEgress),
      diyOption2: formatUSD(comparison.diyOption2.internetEgress),
    },
  ];

  const columns = [
    columnHelper.accessor("category", {
      header: "Category",
      footer: "Total",
    }),
    columnHelper.accessor("foundation", {
      header: "VDC Foundation",
      footer: formatVaultTotal(comparison.vaultFoundation),
    }),
    columnHelper.accessor("advanced", {
      header: "VDC Advanced",
      footer: formatVaultTotal(comparison.vaultAdvanced),
    }),
    columnHelper.accessor("diyOption1", {
      header: comparison.diyOption1Label,
      footer: formatUSD(comparison.diyOption1.total),
    }),
    columnHelper.accessor("diyOption2", {
      header: comparison.diyOption2Label,
      footer: formatUSD(comparison.diyOption2.total),
    }),
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow key={footerGroup.id}>
                {footerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext(),
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
