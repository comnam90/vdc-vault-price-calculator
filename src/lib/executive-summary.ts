import type { ComparisonResult } from "@/types/calculator";

export interface ExecutiveSummary {
  cheapestDiy: { total: number; label: string };
  cheapestVault: { total: number; label: string } | null;
  savings: {
    absolute: number;
    percentage: number;
    vaultWins: boolean;
  } | null;
}

export function deriveExecutiveSummary(
  comparison: ComparisonResult,
): ExecutiveSummary {
  const cheapestDiy = pickCheapestDiy(comparison);
  const cheapestVault = pickCheapestVault(comparison);

  const savings =
    cheapestVault !== null
      ? deriveSavings(cheapestDiy.total, cheapestVault.total)
      : null;

  return { cheapestDiy, cheapestVault, savings };
}

function pickCheapestDiy(comparison: ComparisonResult): {
  total: number;
  label: string;
} {
  if (comparison.diyOption1Unavailable) {
    return {
      total: comparison.diyOption2.total,
      label: comparison.diyOption2Label,
    };
  }

  if (comparison.diyOption1.total <= comparison.diyOption2.total) {
    return {
      total: comparison.diyOption1.total,
      label: comparison.diyOption1Label,
    };
  }

  return {
    total: comparison.diyOption2.total,
    label: comparison.diyOption2Label,
  };
}

function pickCheapestVault(
  comparison: ComparisonResult,
): { total: number; label: string } | null {
  const foundation = comparison.vaultFoundation.total;
  const advanced = comparison.vaultAdvanced.total;

  if (foundation === null && advanced === null) {
    return null;
  }

  if (foundation === null) {
    return { total: advanced!, label: "VDC Vault Advanced" };
  }

  if (advanced === null) {
    return { total: foundation, label: "VDC Vault Foundation" };
  }

  if (foundation <= advanced) {
    return { total: foundation, label: "VDC Vault Foundation" };
  }

  return { total: advanced, label: "VDC Vault Advanced" };
}

function deriveSavings(
  diyTotal: number,
  vaultTotal: number,
): { absolute: number; percentage: number; vaultWins: boolean } {
  const absolute = diyTotal - vaultTotal;
  const percentage = diyTotal === 0 ? 0 : (absolute / diyTotal) * 100;
  const vaultWins = vaultTotal < diyTotal;

  return { absolute, percentage, vaultWins };
}
